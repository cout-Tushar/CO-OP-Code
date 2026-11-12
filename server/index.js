import "dotenv/config";
import mongoose from "mongoose";
import { Resend } from "resend";
import User from "./model/User.js";
import { Code } from "./model/Code.js";
import { createApplication } from "./app.js";
async function start() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required.");
  if (process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL)
    throw new Error("FRONTEND_URL is required in production.");
  const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null;
  const { server, io } = createApplication({
    User,
    Code,
    jwtSecret: process.env.JWT_SECRET,
    frontendUrl: process.env.FRONTEND_URL,
    pistonUrl: process.env.PISTON_API_URL,
    pistonKey: process.env.PISTON_API_KEY,
    sendMail: async (message) => {
      if (!resend) throw new Error("Email is not configured.");
      const result = await resend.emails.send({
        ...message,
        from: process.env.RESEND_FROM || "Co-op Code <onboarding@resend.dev>",
      });
      if (result.error) throw new Error("Email delivery failed.");
    },
  });
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  server.listen(process.env.PORT || 5000, () =>
    console.log("Co-op Code server is ready."),
  );
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    io.close();
    server.close();
    await mongoose.disconnect();
  }
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}
start().catch(() => {
  console.error(
    "Startup failed. Check database availability and required environment configuration.",
  );
  process.exitCode = 1;
});
