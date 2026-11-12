import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep, basename } from "node:path";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { MongoMemoryServer } from "mongodb-memory-server-core";
import { io as connectSocket } from "socket.io-client";
import { createApplication } from "../app.js";
import User from "../model/User.js";
import { Code } from "../model/Code.js";

function nextEvent(socket, event) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(event, success);
      socket.off("connect_error", failure);
      reject(new Error(`Timed out waiting for ${event}`));
    }, 10000);
    function success(value) {
      clearTimeout(timer);
      socket.off("connect_error", failure);
      resolve(value);
    }
    function failure() {
      clearTimeout(timer);
      socket.off(event, success);
      reject(new Error("Socket authentication failed"));
    }
    socket.once(event, success);
    socket.once("connect_error", failure);
  });
}

test("real MongoDB integration", { timeout: 300000 }, async (t) => {
  // The URI is generated here. Never use MONGO_URI or an existing database.
  const tempRoot = await realpath(tmpdir());
  const dbPath = await mkdtemp(join(tempRoot, "coop-mongo-integration-"));
  const jwtSecret = randomBytes(32).toString("hex");
  const messages = [];
  const sockets = new Set();
  let mongo;
  let app;
  let productionProcess;
  let baseUrl;
  let accountToken;
  let roomId;
  let currentPassword = "IntegrationPassword123!";
  const email = "mongo-integration@example.test";

  async function stopApplication() {
    for (const socket of sockets) socket.disconnect();
    sockets.clear();
    if (app) {
      const closing = app;
      app = null;
      await new Promise((resolve) => closing.io.close(resolve));
    }
  }

  t.after(async () => {
    if (productionProcess && productionProcess.exitCode === null) {
      const exited = new Promise((resolve) =>
        productionProcess.once("exit", resolve),
      );
      productionProcess.kill();
      await exited;
    }
    await stopApplication();
    await mongoose.disconnect();
    if (mongo) await mongo.stop({ doCleanup: false });
    // Only remove the new, disposable directory created by this test.
    const resolved = await realpath(dbPath);
    assert.ok(resolved.startsWith(tempRoot + sep));
    assert.ok(basename(resolved).startsWith("coop-mongo-integration-"));
    await rm(resolved, { recursive: true, force: true });
  });

  mongo = await MongoMemoryServer.create({
    binary: { version: "8.2.6" },
    instance: { dbPath, storageEngine: "wiredTiger", ip: "127.0.0.1" },
  });

  async function startApplication() {
    await mongoose.connect(mongo.getUri("coop_integration"), {
      serverSelectionTimeoutMS: 10000,
    });
    await Promise.all([User.init(), Code.init()]);
    app = createApplication({
      User,
      Code,
      jwtSecret,
      sendMail: async (message) => messages.push(message),
      executeFetch: async () => {
        throw new Error(
          "External execution is intentionally disabled in MongoDB tests",
        );
      },
    });
    await new Promise((resolve) => app.server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${app.server.address().port}`;
  }

  async function request(path, body, token, url = baseUrl) {
    const response = await fetch(`${url}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(15000),
    });
    return { status: response.status, data: await response.json() };
  }

  async function socket(token = accountToken, url = baseUrl) {
    const client = connectSocket(url, {
      autoConnect: false,
      auth: { token },
      reconnection: false,
      transports: ["websocket"],
    });
    sockets.add(client);
    const ready = nextEvent(client, "connect");
    client.connect();
    await ready;
    return client;
  }
  const emit = (client, event, payload) =>
    client.timeout(10000).emitWithAck(event, payload);

  await startApplication();
  const buildInfo = await mongoose.connection.db
    .admin()
    .command({ buildInfo: 1 });
  t.diagnostic(
    `Real mongod ${buildInfo.version}; WiredTiger; isolated loopback database`,
  );

  await t.test(
    "registration and authentication use persisted users",
    async () => {
      const registration = await request("/api/register", {
        username: "MongoIntegration",
        email,
        password: currentPassword,
      });
      assert.equal(registration.status, 201);
      const user = await User.findOne({ email }).lean();
      assert.ok(user);
      assert.notEqual(user.password, currentPassword);
      assert.equal(await bcrypt.compare(currentPassword, user.password), true);
      const login = await request("/api/signin", {
        email,
        password: currentPassword,
      });
      assert.equal(login.status, 200);
      accountToken = login.data.token;
      assert.equal(login.data.user.username, "MongoIntegration");
    },
  );

  await t.test(
    "MongoDB enforces unique email, username and room indexes",
    async () => {
      const userIndexes = await User.collection.indexes();
      const codeIndexes = await Code.collection.indexes();
      assert.ok(
        userIndexes.some((index) => index.key.email === 1 && index.unique),
      );
      assert.ok(
        userIndexes.some((index) => index.key.username === 1 && index.unique),
      );
      assert.ok(
        codeIndexes.some((index) => index.key.roomId === 1 && index.unique),
      );
      await assert.rejects(
        User.create({
          username: "DifferentName",
          email,
          password: "test-only-hash",
        }),
        { code: 11000 },
      );
      await assert.rejects(
        User.create({
          username: "MongoIntegration",
          email: "other@example.test",
          password: "test-only-hash",
        }),
        { code: 11000 },
      );
    },
  );

  await t.test(
    "room edits are broadcast and saved once in the real collection",
    async () => {
      const created = await request("/create-room", undefined, accountToken);
      assert.equal(created.status, 200);
      roomId = created.data.roomId;
      const a = await socket();
      const b = await socket();
      assert.equal((await emit(a, "join-room", { roomId })).ok, true);
      assert.equal((await emit(b, "join-room", { roomId })).ok, true);
      const updated = nextEvent(b, "code-update");
      assert.equal(
        (await emit(a, "code-change", { roomId, code: "console.log(42);" })).ok,
        true,
      );
      assert.equal(await updated, "console.log(42);");
      await Promise.all([
        emit(a, "code-change", { roomId, code: "first saved edit" }),
        emit(a, "code-change", { roomId, code: "persist across restart" }),
      ]);
      assert.equal(await Code.countDocuments({ roomId }), 1);
      assert.equal(
        (await Code.findOne({ roomId }).lean()).code,
        "persist across restart",
      );
      await assert.rejects(Code.create({ roomId, code: "duplicate" }), {
        code: 11000,
      });
    },
  );

  await t.test(
    "reset tokens are hashed and atomically consumed under concurrent requests",
    async () => {
      assert.equal(
        (await request("/api/forgot-password", { email })).status,
        200,
      );
      const resetToken = new URL(
        messages.at(-1).html.match(/href="([^"]+)"/)[1],
      ).searchParams.get("token");
      const user = await User.findOne({ email }).lean();
      assert.match(user.resetPasswordToken, /^sha256:/);
      assert.notEqual(user.resetPasswordToken, resetToken);
      currentPassword = "ChangedIntegrationPassword123!";
      const results = await Promise.all([
        request(`/api/reset-password/${resetToken}`, {
          password: currentPassword,
        }),
        request(`/api/reset-password/${resetToken}`, {
          password: currentPassword,
        }),
      ]);
      assert.deepEqual(
        results.map((result) => result.status).sort(),
        [200, 400],
      );
      const updated = await User.findOne({ email }).lean();
      assert.equal(updated.resetPasswordToken, undefined);
      assert.equal(updated.resetPasswordExpires, undefined);
      assert.equal(
        (await request("/api/signin", { email, password: currentPassword }))
          .status,
        200,
      );
      assert.equal(
        (
          await request("/api/signin", {
            email,
            password: "IntegrationPassword123!",
          })
        ).status,
        401,
      );
    },
  );

  await t.test(
    "saved code and accounts survive both MongoDB and backend restart",
    async () => {
      await stopApplication();
      await mongoose.disconnect();
      await mongo.stop({ doCleanup: false });
      await mongo.start();
      await startApplication();
      const login = await request("/api/signin", {
        email,
        password: currentPassword,
      });
      assert.equal(login.status, 200);
      accountToken = login.data.token;
      const client = await socket();
      const loaded = nextEvent(client, "code-update");
      assert.equal((await emit(client, "join-room", { roomId })).ok, true);
      assert.equal(await loaded, "persist across restart");
    },
  );

  await t.test(
    "the production entry point starts against MongoDB and serves persisted accounts",
    async () => {
      await stopApplication();
      const reservation = createServer();
      await new Promise((resolve) =>
        reservation.listen(0, "127.0.0.1", resolve),
      );
      const port = reservation.address().port;
      await new Promise((resolve) => reservation.close(resolve));
      const url = `http://127.0.0.1:${port}`;
      productionProcess = spawn(process.execPath, ["index.js"], {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        env: {
          ...process.env,
          MONGO_URI: mongo.getUri("coop_integration"),
          JWT_SECRET: jwtSecret,
          PORT: String(port),
          NODE_ENV: "production",
          FRONTEND_URL: "http://localhost:3000",
          RESEND_API_KEY: "",
          PISTON_API_KEY: "",
        },
        windowsHide: true,
        stdio: "ignore",
      });
      let ready = false;
      for (let attempt = 0; attempt < 40; attempt++) {
        if (productionProcess.exitCode !== null) break;
        try {
          const response = await fetch(url, {
            signal: AbortSignal.timeout(500),
          });
          if (response.ok) {
            ready = true;
            break;
          }
        } catch {
          /* The child is still connecting to MongoDB. */
        }
        await delay(250);
      }
      assert.equal(ready, true, "Production entry point did not become ready");
      const login = await request(
        "/api/signin",
        { email, password: currentPassword },
        undefined,
        url,
      );
      assert.equal(login.status, 200);
      const client = await socket(login.data.token, url);
      const loaded = nextEvent(client, "code-update");
      assert.equal((await emit(client, "join-room", { roomId })).ok, true);
      assert.equal(await loaded, "persist across restart");
    },
  );
});
