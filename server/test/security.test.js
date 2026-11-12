import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { createLimiter, verifyToken } from "../lib/security.js";
import {
  validPassword,
  validRoomId,
  validPosition,
} from "../lib/validation.js";
import { fixture } from "./fixtures.js";
async function setup(t, overrides) {
  const app = await fixture(overrides);
  t.after(() => app.close());
  return app;
}
test("existing bcrypt accounts with long passwords can still sign in", async (t) => {
  const app = await setup(t);
  const password = "legacy-password-".repeat(7);
  app.users.get(app.id).password = await bcrypt.hash(password, 4);
  const result = await app.request("/api/signin", {
    email: "ada@example.test",
    password,
  });
  assert.equal(result.status, 200);
});
test("validation rejects structured injection and invalid bounds", () => {
  assert.equal(validRoomId({ $ne: null }), false);
  assert.equal(validRoomId("../secret"), false);
  assert.equal(validRoomId("room_123-test"), true);
  assert.equal(validPassword("a".repeat(73)), false);
  assert.equal(validPassword("💜".repeat(19)), false);
  assert.equal(validPassword("12345678"), true);
  assert.equal(validPosition({ lineNumber: -1, column: 0 }), false);
});
test("rate limit expires without unbounded map growth", () => {
  let time = 0;
  const allow = createLimiter({
    limit: 2,
    windowMs: 1000,
    maxKeys: 1,
    now: () => time,
  });
  assert.equal(allow("a"), true);
  assert.equal(allow("a"), true);
  assert.equal(allow("a"), false);
  assert.equal(allow("b"), false);
  time = 1001;
  assert.equal(allow("b"), true);
});
test("JWT validation rejects expired, missing expiry and malformed subjects", () => {
  const secret = "a".repeat(32);
  const id = "123456789012345678901234";
  for (const token of [
    jwt.sign({ id }, secret),
    jwt.sign({ id }, secret, { expiresIn: -1 }),
    jwt.sign({ id: { $ne: null } }, secret, { expiresIn: 60 }),
  ])
    assert.throws(() => verifyToken(token, secret));
});
test("room creation requires a valid signed token", async (t) => {
  const app = await setup(t);
  assert.equal((await app.request("/create-room")).status, 401);
  assert.equal(
    (await app.request("/create-room", undefined, "invalid")).status,
    401,
  );
  const result = await app.request("/create-room", undefined, app.token);
  assert.equal(result.status, 200);
  assert.match(result.data.roomId, /^[a-f0-9-]{36}$/);
  assert.equal(result.headers.get("x-content-type-options"), "nosniff");
});
test("sign in preserves payload and uses generic invalid credentials", async (t) => {
  const app = await setup(t);
  const good = await app.request("/api/signin", {
    email: "ADA@example.test",
    password: "Password123!",
  });
  assert.equal(good.status, 200);
  assert.equal(good.data.user.username, "Ada");
  assert.ok(good.data.token);
  assert.equal(good.data.user.password, undefined);
  const missing = await app.request("/api/signin", {
    email: "missing@example.test",
    password: "Password123!",
  });
  const wrong = await app.request("/api/signin", {
    email: "ada@example.test",
    password: "wrong",
  });
  assert.deepEqual(missing.data, wrong.data);
  assert.equal(missing.status, 401);
  assert.equal(
    (
      await app.request("/api/signin", {
        email: { $ne: null },
        password: "test",
      })
    ).status,
    400,
  );
});
test("registration validates, hashes passwords, and rejects duplicates", async (t) => {
  const app = await setup(t);
  assert.equal(
    (
      await app.request("/api/register", {
        username: "test",
        email: "new@example.test",
        password: "short",
      })
    ).status,
    400,
  );
  const payload = {
    username: "Grace",
    email: "GRACE@example.test",
    password: "Password123!",
  };
  assert.equal((await app.request("/api/register", payload)).status, 201);
  const user = await app.User.findOne({ email: "grace@example.test" });
  assert.notEqual(user.password, payload.password);
  assert.equal((await app.request("/api/register", payload)).status, 409);
});
test("reset responses do not enumerate accounts; tokens are hashed and single-use", async (t) => {
  const app = await setup(t);
  const known = await app.request("/api/forgot-password", {
    email: "ada@example.test",
  });
  const unknown = await app.request("/api/forgot-password", {
    email: "nobody@example.test",
  });
  assert.deepEqual(known.data, unknown.data);
  const token = new URL(
    app.mails[0].html.match(/href="([^"]+)"/)[1],
  ).searchParams.get("token");
  const saved = app.users.get(app.id).resetPasswordToken;
  assert.notEqual(saved, token);
  assert.match(saved, /^sha256:/);
  assert.equal(
    (
      await app.request(`/api/reset-password/${saved}`, {
        password: "NewPassword123!",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await app.request(`/api/reset-password/${token}`, {
        password: "NewPassword123!",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await app.request(`/api/reset-password/${token}`, {
        password: "NewPassword123!",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await app.request("/api/signin", {
        email: "ada@example.test",
        password: "NewPassword123!",
      })
    ).status,
    200,
  );
});
test("expired reset links and provider failures are handled safely", async (t) => {
  const app = await setup(t, {
    sendMail: async () => {
      throw new Error("private provider credential");
    },
  });
  const result = await app.request("/api/forgot-password", {
    email: "ada@example.test",
  });
  assert.equal(result.status, 200);
  assert.equal(app.users.get(app.id).resetPasswordToken, undefined);
  app.users.get(app.id).resetPasswordToken = "a".repeat(64);
  app.users.get(app.id).resetPasswordExpires = new Date(0);
  assert.equal(
    (
      await app.request(`/api/reset-password/${"a".repeat(64)}`, {
        password: "NewPassword123!",
      })
    ).status,
    400,
  );
});
test("execution is authorized, validated and forwards bounded runner configuration", async (t) => {
  const app = await setup(t);
  const body = { language: "javascript", code: "console.log(42)" };
  assert.equal((await app.request("/api/execute", body)).status, 401);
  assert.equal(
    (
      await app.request(
        "/api/execute",
        { ...body, language: "html" },
        app.token,
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await app.request(
        "/api/execute",
        { ...body, code: "a".repeat(100001) },
        app.token,
      )
    ).status,
    400,
  );
  const result = await app.request("/api/execute", body, app.token);
  assert.equal(result.data.output, "42\n");
  const sent = JSON.parse(app.executions[0].options.body);
  assert.equal(sent.version, "*");
  assert.equal(sent.run_timeout, 3000);
});
test("execution provider errors do not expose upstream internals", async (t) => {
  const app = await setup(t, {
    executeFetch: async () =>
      new Response("private runner failure", { status: 403 }),
  });
  const result = await app.request(
    "/api/execute",
    { language: "python", code: "print(42)" },
    app.token,
  );
  assert.equal(result.status, 502);
  assert.ok(!result.data.output.includes("private"));
});
test("malformed JSON and oversized HTTP requests return safe errors", async (t) => {
  const app = await setup(t);
  for (const [body, status] of [
    ["{", 400],
    [JSON.stringify({ code: "x".repeat(530000) }), 413],
  ]) {
    const response = await fetch(`${app.url}/api/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    assert.equal(response.status, status);
    assert.equal((await response.json()).error, undefined);
  }
});
