import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createApplication } from "../app.js";
export async function fixture(overrides = {}) {
  const users = new Map();
  const codes = new Map();
  const mails = [];
  const executions = [];
  const id = "123456789012345678901234";
  const jwtSecret = randomBytes(32).toString("hex");
  users.set(id, {
    _id: id,
    username: "Ada",
    email: "ada@example.test",
    password: await bcrypt.hash("Password123!", 4),
  });
  const matches = (user, query) =>
    Object.entries(query).every(([key, value]) => {
      if (key === "$or") return value.some((item) => matches(user, item));
      if (value && typeof value === "object" && "$in" in value)
        return value.$in.includes(user[key]);
      if (value && typeof value === "object" && "$gt" in value)
        return user[key] > value.$gt;
      return user[key] === value;
    });
  const update = (user, changes) => {
    Object.assign(user, changes.$set || {});
    for (const key of Object.keys(changes.$unset || {})) delete user[key];
  };
  const User = {
    findOne: async (query) =>
      [...users.values()].find((user) => matches(user, query)) || null,
    findById: (key) => ({
      select: () => ({ lean: async () => users.get(key) || null }),
    }),
    create: async (data) => {
      const key = randomBytes(12).toString("hex");
      const user = { ...data, _id: key };
      users.set(key, user);
      return user;
    },
    updateOne: async (query, changes) => {
      const user = [...users.values()].find((user) => matches(user, query));
      if (user) update(user, changes);
      return { matchedCount: user ? 1 : 0 };
    },
    findOneAndUpdate: async (query, changes) => {
      const user = [...users.values()].find((user) => matches(user, query));
      if (!user) return null;
      update(user, changes);
      return user;
    },
  };
  const Code = {
    findOne: ({ roomId }) => ({
      select: () => ({
        lean: async () =>
          codes.has(roomId) ? { code: codes.get(roomId) } : null,
      }),
    }),
    findOneAndUpdate: async ({ roomId }, changes) => {
      codes.set(roomId, changes.$set.code);
    },
  };
  const context = {
    User,
    Code,
    jwtSecret,
    sendMail: async (mail) => {
      mails.push(mail);
    },
    executeFetch: async (url, options) => {
      executions.push({ url, options });
      return new Response(JSON.stringify({ run: { output: "42\n" } }), {
        status: 200,
      });
    },
    ...overrides,
  };
  const application = createApplication(context);
  await new Promise((resolve) =>
    application.server.listen(overrides.port || 0, "127.0.0.1", resolve),
  );
  const url = `http://127.0.0.1:${application.server.address().port}`;
  const token = jwt.sign({ id }, jwtSecret, { expiresIn: "1h" });
  const request = async (path, body, authToken) => {
    const response = await fetch(`${url}${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    return {
      status: response.status,
      data: await response.json(),
      headers: response.headers,
    };
  };
  return {
    ...application,
    ...context,
    users,
    codes,
    mails,
    executions,
    id,
    token,
    url,
    request,
    close: () => new Promise((resolve) => application.io.close(resolve)),
  };
}
