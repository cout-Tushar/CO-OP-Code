import express from "express";
import cors from "cors";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passwordResetRoutes from "./routes/passwordReset.js";
import { authenticate, rateLimit } from "./lib/security.js";
import { judge0Languages, runJudge0 } from "./lib/judge0.js";
import {
  validEmail,
  validPassword,
  validUsername,
  validCode,
} from "./lib/validation.js";
import { attachCollaboration } from "./collaboration.js";
const dummyPasswordHash = bcrypt.hashSync("invalid-account-password", 12);

export function createApplication({
  User,
  Code,
  jwtSecret,
  frontendUrl = "http://localhost:3000",
  sendMail,
  executeFetch = fetch,
  judge0Url,
  judge0Key,
}) {
  if (!jwtSecret || jwtSecret.length < 32)
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  const app = express();
  app.disable("x-powered-by");
  const origins = frontendUrl
    .split(",")
    .map((value) => new URL(value.trim()).origin);
  const corsOptions = {
    origin: origins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  app.use(cors(corsOptions));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "512kb" }));
  const authLimit = rateLimit({ limit: 20, windowMs: 900000 });
  const auth = authenticate(jwtSecret);
  app.get("/", (req, res) => res.send("CodeColab Server is running"));
  app.get(
    "/create-room",
    auth,
    rateLimit({ limit: 30, windowMs: 60000 }),
    (req, res) => res.json({ roomId: randomUUID() }),
  );
  app.post("/api/signin", authLimit, async (req, res) => {
    const { email, password } = req.body || {};
    if (
      !validEmail(email) ||
      typeof password !== "string" ||
      !password ||
      Buffer.byteLength(password) > 1024
    )
      return res.status(400).json({ msg: "Enter a valid email and password." });
    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      const passwordMatches = await bcrypt.compare(
        password,
        user?.password || dummyPasswordHash,
      );
      if (!user || !passwordMatches)
        return res.status(401).json({ msg: "Invalid email or password." });
      const token = jwt.sign({ id: String(user._id) }, jwtSecret, {
        expiresIn: "1d",
        algorithm: "HS256",
      });
      res.json({ token, user: { id: user._id, username: user.username } });
    } catch {
      res.status(503).json({ msg: "Sign in is temporarily unavailable." });
    }
  });
  app.post("/api/register", authLimit, async (req, res) => {
    const { username, email, password } = req.body || {};
    if (
      !validUsername(username) ||
      !validEmail(email) ||
      !validPassword(password)
    )
      return res.status(400).json({
        msg: "Use a 2–40 character username, valid email, and password of 8–72 bytes.",
      });
    try {
      const existing = await User.findOne({
        $or: [
          { email: email.trim().toLowerCase() },
          { username: username.trim() },
        ],
      });
      if (existing)
        return res.status(409).json({
          msg: "Unable to register with these details. Try signing in or choose another username.",
        });
      await User.create({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: await bcrypt.hash(password, 12),
      });
      res
        .status(201)
        .json({ msg: "Account created. Sign in to start your first session." });
    } catch (error) {
      res
        .status(error.code === 11000 ? 409 : 503)
        .json({ msg: "Unable to create this account. Please try again." });
    }
  });
  app.use(
    "/api",
    (req, res, next) =>
      req.path === "/forgot-password" || req.path.startsWith("/reset-password/")
        ? authLimit(req, res, next)
        : next(),
    passwordResetRoutes({ User, sendMail, frontendUrl: origins[0] }),
  );
  app.post(
    "/api/execute",
    auth,
    rateLimit({ limit: 10, windowMs: 60000 }),
    async (req, res) => {
      const { language, code } = req.body || {};
      if (!judge0Languages.has(language) || !validCode(code) || !code.trim())
        return res.status(400).json({
          output:
            "Choose JavaScript, Python, C++, or Java and provide 1–100,000 characters of code.",
        });
      try {
        const output = await runJudge0({
          apiUrl: judge0Url,
          apiKey: judge0Key,
          fetchRunner: executeFetch,
          language,
          code,
        });
        res.json({ output });
      } catch {
        res.status(502).json({
          output: "The code runner could not respond. Please try again.",
        });
      }
    },
  );
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const status =
      error.type === "entity.too.large"
        ? 413
        : error instanceof SyntaxError
          ? 400
          : 500;
    res.status(status).json({
      msg:
        status === 413
          ? "Request is too large."
          : status === 400
            ? "Invalid JSON request."
            : "Something went wrong.",
    });
  });
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: corsOptions,
    maxHttpBufferSize: 512000,
    allowRequest: (req, done) =>
      done(null, !req.headers.origin || origins.includes(req.headers.origin)),
  });
  attachCollaboration(io, { User, Code, jwtSecret });
  return { app, server, io };
}
