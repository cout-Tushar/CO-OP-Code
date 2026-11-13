import test from "node:test";
import assert from "node:assert/strict";
import { io } from "socket.io-client";
import jwt from "jsonwebtoken";
import { fixture } from "./fixtures.js";
const once = (socket, event) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timed out: ${event}`)),
      3000,
    );
    socket.once(event, (value) => {
      clearTimeout(timer);
      resolve(value);
    });
  });
const emit = (socket, event, payload) =>
  socket.timeout(3000).emitWithAck(event, payload);
async function setup(t) {
  const app = await fixture();
  const sockets = [];
  t.after(async () => {
    sockets.forEach((socket) => socket.disconnect());
    await app.close();
  });
  const connect = async (token = app.token) => {
    const socket = io(app.url, {
      auth: { token },
      autoConnect: false,
      reconnection: false,
      transports: ["websocket"],
    });
    sockets.push(socket);
    const ready = once(socket, token ? "connect" : "connect_error");
    socket.connect();
    await ready;
    return socket;
  };
  return { ...app, connect };
}
test("socket rejects unauthenticated connections", async (t) => {
  const app = await setup(t);
  const socket = await app.connect("");
  assert.equal(socket.connected, false);
});
test("membership is required for edits and chat; malformed payloads do not crash", async (t) => {
  const app = await setup(t);
  const socket = await app.connect();
  assert.equal(
    (await emit(socket, "code-change", { roomId: "private", code: "bad" })).ok,
    false,
  );
  assert.equal((await emit(socket, "join-room", null)).ok, false);
  assert.equal((await emit(socket, "join-room", { roomId: "test" })).ok, true);
  assert.equal(
    (await emit(socket, "code-change", { roomId: "other", code: "bad" })).ok,
    false,
  );
  assert.equal(
    (await emit(socket, "chat-message", { roomId: "other", text: "bad" })).ok,
    false,
  );
  assert.equal(app.codes.size, 0);
});
test("saved code, empty reset, chat identity and cursor updates reach collaborators", async (t) => {
  const app = await setup(t);
  const a = await app.connect();
  const b = await app.connect();
  await emit(a, "join-room", { roomId: "pair" });
  await emit(b, "join-room", { roomId: "pair" });
  let update = once(b, "code-update");
  assert.equal(
    (await emit(a, "code-change", { roomId: "pair", code: "hello" })).ok,
    true,
  );
  assert.equal(await update, "hello");
  assert.equal(app.codes.get("pair"), "hello");
  update = once(b, "code-update");
  await emit(a, "code-change", { roomId: "pair", code: "" });
  assert.equal(await update, "");
  const message = once(b, "chat-message");
  await emit(a, "chat-message", {
    roomId: "pair",
    text: "Hi",
    username: "Administrator",
  });
  assert.deepEqual(await message, { text: "Hi", username: "Ada" });
  const cursor = once(b, "cursor-update");
  a.emit("cursor-move", {
    roomId: "pair",
    username: "Other",
    color: "url(evil)",
    position: { lineNumber: 1, column: 2 },
  });
  assert.equal((await cursor).username, "Ada");
});
test("save failure is acknowledged without a successful broadcast", async (t) => {
  const app = await setup(t);
  const socket = await app.connect();
  await emit(socket, "join-room", { roomId: "pair" });
  app.Code.findOneAndUpdate = async () => {
    throw new Error("database secret");
  };
  const result = await emit(socket, "code-change", {
    roomId: "pair",
    code: "keep me",
  });
  assert.equal(result.ok, false);
  assert.ok(!result.msg.includes("secret"));
});
test("writes are serialized and reconnect loads the latest saved document", async (t) => {
  const app = await setup(t);
  const a = await app.connect();
  await emit(a, "join-room", { roomId: "pair" });
  const original = app.Code.findOneAndUpdate;
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  let started;
  const firstStarted = new Promise((resolve) => {
    started = resolve;
  });
  app.Code.findOneAndUpdate = async (query, changes) => {
    if (changes.$set.code === "first") {
      started();
      await held;
    }
    await original(query, changes);
  };
  const first = emit(a, "code-change", { roomId: "pair", code: "first" });
  await firstStarted;
  const second = emit(a, "code-change", { roomId: "pair", code: "second" });
  release();
  await Promise.all([first, second]);
  assert.equal(app.codes.get("pair"), "second");
  a.disconnect();
  const b = await app.connect();
  const loaded = once(b, "code-update");
  await emit(b, "join-room", { roomId: "pair" });
  assert.equal(await loaded, "second");
});
test("leaving a room revokes event membership", async (t) => {
  const app = await setup(t);
  const a = await app.connect();
  await emit(a, "join-room", { roomId: "pair" });
  a.emit("leave-room", { roomId: "pair" });
  assert.equal(
    (await emit(a, "code-change", { roomId: "pair", code: "bad" })).ok,
    false,
  );
});

test("cursor presence preserves identity, selections, snapshots and cleanup", async (t) => {
  const app = await setup(t);
  const id = "abcdefabcdefabcdefabcdef";
  app.users.set(id, { _id: id, username: "Grace" });
  const token = jwt.sign({ id }, app.jwtSecret, { expiresIn: "1h" });
  const a = await app.connect();
  const b = await app.connect(token);
  await emit(a, "join-room", { roomId: "pair" });
  await emit(b, "join-room", { roomId: "pair" });
  const selection = {
    anchor: { lineNumber: 1, column: 1 },
    head: { lineNumber: 2, column: 3 },
  };
  const moved = once(a, "cursor-update");
  b.emit("cursor-move", {
    roomId: "pair",
    position: selection.head,
    selection,
    username: "Spoof",
  });
  const cursor = await moved;
  assert.equal(cursor.username, "Grace");
  assert.equal(cursor.userId, id);
  assert.equal(cursor.id, b.id);
  assert.deepEqual(cursor.selection, selection);
  const c = await app.connect();
  const snapshot = once(c, "cursor-snapshot");
  await emit(c, "join-room", { roomId: "pair" });
  assert.deepEqual(await snapshot, [cursor]);
  const removed = once(a, "cursor-remove");
  await emit(b, "join-room", { roomId: "different" });
  assert.deepEqual(await removed, { id: b.id, roomId: "pair" });
  await emit(b, "join-room", { roomId: "pair" });
  const again = once(a, "cursor-update");
  b.emit("cursor-move", { roomId: "pair", position: selection.head });
  assert.equal((await again).color, cursor.color);
  const disconnected = once(a, "cursor-remove");
  const socketId = b.id;
  b.disconnect();
  assert.equal((await disconnected).id, socketId);
});
