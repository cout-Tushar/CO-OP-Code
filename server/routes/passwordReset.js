import express from "express";
import crypto from "crypto";
import User from "../model/User.js";
import { Resend } from "resend";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();


const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ---------------- //
// FORGOT PASSWORD  //
// ---------------- //

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "No account found with this email" });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;


    // Save token in DB
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save();

    // Send email using Resend
    await resend.emails.send({
      from: "Co-op Code  <onboarding@resend.dev>",
      to: email,
      subject: "Password Reset Link",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 10 minutes.</p>
      `
    });

    return res.json({ msg: "Password reset link sent!" });

  } catch (err) {
    console.error("Password Reset Error:", err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
});

// ---------------- //
// RESET PASSWORD   //
// ---------------- //



router.post("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    // 🔥 HASH THE PASSWORD HERE
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({ msg: "Password successfully reset!" });

  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({ msg: "Something went wrong" });
  }
});


export default router;
