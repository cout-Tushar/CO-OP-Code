import express from "express";
import crypto from "node:crypto";
import bcrypt from "bcrypt";
import { validEmail, validPassword } from "../lib/validation.js";
const digest = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
const genericMessage =
  "If an account exists with that email, a reset link will arrive shortly.";
export default function passwordResetRoutes({ User, sendMail, frontendUrl }) {
  const router = express.Router();
  router.post("/forgot-password", async (req, res) => {
    const { email } = req.body || {};
    if (!validEmail(email))
      return res.status(400).json({ msg: "Enter a valid email address." });
    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        const hash = `sha256:${digest(token)}`;
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              resetPasswordToken: hash,
              resetPasswordExpires: new Date(Date.now() + 600000),
            },
          },
        );
        const resetUrl = new URL("/reset-password", frontendUrl);
        resetUrl.searchParams.set("token", token);
        try {
          await sendMail({
            to: user.email,
            subject: "Reset your Co-op Code password",
            html: `<h2>Reset your password</h2><p><a href="${resetUrl.href}">Choose a new password</a></p><p>This link expires in 10 minutes. If you did not request it, you can ignore this email.</p>`,
          });
        } catch {
          await User.updateOne(
            { _id: user._id, resetPasswordToken: hash },
            { $unset: { resetPasswordToken: "", resetPasswordExpires: "" } },
          );
          console.error("Password reset email delivery failed.");
        }
      }
      return res.json({ msg: genericMessage });
    } catch {
      return res
        .status(503)
        .json({ msg: "Password recovery is temporarily unavailable." });
    }
  });
  router.post("/reset-password/:token", async (req, res) => {
    const { password } = req.body || {};
    const { token } = req.params;
    if (!/^[a-f0-9]{64}$/.test(token) || !validPassword(password))
      return res
        .status(400)
        .json({ msg: "Use a valid reset link and a password of 8–72 bytes." });
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      // Accept outstanding legacy plaintext links for their existing 10-minute lifetime.
      const user = await User.findOneAndUpdate(
        {
          resetPasswordToken: { $in: [`sha256:${digest(token)}`, token] },
          resetPasswordExpires: { $gt: new Date() },
        },
        {
          $set: { password: hashedPassword },
          $unset: { resetPasswordToken: "", resetPasswordExpires: "" },
        },
      );
      if (!user)
        return res
          .status(400)
          .json({ msg: "Invalid or expired reset link. Request a new one." });
      return res.json({
        msg: "Your password has been reset. You can now sign in.",
      });
    } catch {
      return res
        .status(503)
        .json({ msg: "Password reset is temporarily unavailable." });
    }
  });
  return router;
}
