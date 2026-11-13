import { createLimiter, verifyToken } from "./lib/security.js";
import { validRoomId, validCode, validPosition } from "./lib/validation.js";
export function attachCollaboration(io, { User, Code, jwtSecret }) {
  // Serialize saves within each room so an older write cannot overwrite a newer one.
  const queues = new Map();
  const queue = (roomId, task) => {
    const work = (queues.get(roomId) || Promise.resolve())
      .catch(() => {})
      .then(task);
    queues.set(roomId, work);
    work
      .finally(() => {
        if (queues.get(roomId) === work) queues.delete(roomId);
      })
      .catch(() => {});
    return work;
  };
  io.use(async (socket, next) => {
    try {
      const auth = verifyToken(socket.handshake.auth?.token, jwtSecret);
      const user = await User.findById(auth.id).select("username").lean();
      if (!user) throw new Error("Unauthorized");
      socket.data.username = user.username;
      socket.data.userId = String(auth.id);
      let hue = 0;
      for (const char of String(auth.id))
        hue = (hue * 31 + char.charCodeAt(0)) % 360;
      socket.data.color = `hsl(${hue}, 78%, 72%)`;
      socket.data.expires = auth.exp * 1000;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });
  io.on("connection", (socket) => {
    const allow = createLimiter({ limit: 160, windowMs: 1000, maxKeys: 1 });
    const joins = createLimiter({ limit: 10, windowMs: 60000, maxKeys: 1 });
    const writes = createLimiter({ limit: 10, windowMs: 1000, maxKeys: 1 });
    let joinSequence = 0;
    const ack = (callback, result) => {
      if (typeof callback === "function") callback(result);
    };
    const active = () => socket.connected && Date.now() < socket.data.expires;
    const member = (roomId) =>
      active() &&
      validRoomId(roomId) &&
      socket.data.roomId === roomId &&
      socket.rooms.has(roomId);
    function leave() {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.to(roomId).emit("chat-message", {
        username: "System",
        text: `${socket.data.username} left the room`,
        system: true,
      });
      socket.to(roomId).emit("cursor-remove", { id: socket.id, roomId });
      socket.data.cursor = null;
      socket.leave(roomId);
      socket.data.roomId = null;
    }
    const expiryTimer = setTimeout(
      () => socket.disconnect(true),
      Math.max(0, socket.data.expires - Date.now()),
    );
    expiryTimer.unref();
    socket.on("join-room", async (payload, callback) => {
      const roomId = payload?.roomId;
      if (!active() || !validRoomId(roomId) || !joins("join"))
        return ack(callback, {
          ok: false,
          msg: "Invalid room or too many join attempts.",
        });
      const sequence = ++joinSequence;
      try {
        await queue(roomId, async () => {
          const existing = await Code.findOne({ roomId }).select("code").lean();
          if (!active() || sequence !== joinSequence) return;
          leave();
          await socket.join(roomId);
          socket.data.roomId = roomId;
          socket.emit("code-update", existing?.code ?? "// Start typing...");
          socket.to(roomId).emit("chat-message", {
            username: "System",
            text: `${socket.data.username} joined the room`,
            system: true,
          });
          snapshot();
          ack(callback, { ok: true });
        });
      } catch {
        ack(callback, {
          ok: false,
          msg: "Could not load this room. Please retry.",
        });
      }
    });
    socket.on("code-change", (payload, callback) => {
      const { roomId, code } = payload || {};
      if (
        !member(roomId) ||
        !validCode(code) ||
        !allow("event") ||
        !writes("write")
      )
        return ack(callback, {
          ok: false,
          msg: "Invalid edit, room access, or too many edits.",
        });
      queue(roomId, async () => {
        await Code.findOneAndUpdate(
          { roomId },
          { $set: { code } },
          { upsert: true },
        );
        socket.to(roomId).emit("code-update", code);
      })
        .then(() => ack(callback, { ok: true }))
        .catch(() => {
          ack(callback, {
            ok: false,
            msg: "Code could not be saved. Keep a local copy and retry.",
          });
          socket.emit("room-error", {
            msg: "Code could not be saved. Keep a local copy and retry.",
          });
        });
    });
    const snapshot = () => {
      const roomId = socket.data.roomId;
      if (!member(roomId)) return;
      const cursors = [...(io.sockets.adapter.rooms.get(roomId) || [])]
        .filter((id) => id !== socket.id)
        .map((id) => io.sockets.sockets.get(id)?.data.cursor)
        .filter(Boolean);
      socket.emit("cursor-snapshot", cursors);
    };
    socket.on("cursor-sync", snapshot);
    socket.on("cursor-move", (payload) => {
      const { roomId, position, selection } = payload || {};
      if (!member(roomId) || !validPosition(position) || !allow("event"))
        return;
      if (
        selection &&
        (!validPosition(selection.anchor) || !validPosition(selection.head))
      )
        return;
      const cursor = {
        id: socket.id,
        userId: socket.data.userId,
        roomId,
        username: socket.data.username,
        color: socket.data.color,
        position: { lineNumber: position.lineNumber, column: position.column },
        selection: selection
          ? {
              anchor: {
                lineNumber: selection.anchor.lineNumber,
                column: selection.anchor.column,
              },
              head: {
                lineNumber: selection.head.lineNumber,
                column: selection.head.column,
              },
            }
          : { anchor: position, head: position },
      };
      socket.data.cursor = cursor;
      socket.to(roomId).emit("cursor-update", cursor);
    });
    socket.on("chat-message", (payload, callback) => {
      const { roomId, text } = payload || {};
      if (
        !member(roomId) ||
        typeof text !== "string" ||
        !text.trim() ||
        text.length > 2000 ||
        !allow("event")
      )
        return ack(callback, {
          ok: false,
          msg: "Message could not be sent. Check your connection and message length.",
        });
      socket.to(roomId).emit("chat-message", {
        text: text.trim(),
        username: socket.data.username,
      });
      ack(callback, { ok: true });
    });
    socket.on("leave-room", () => {
      ++joinSequence;
      leave();
    });
    socket.on("disconnecting", () => {
      ++joinSequence;
      leave();
      clearTimeout(expiryTimer);
    });
  });
}
