"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GitBranch } from "lucide-react";
import { api } from "@/lib/api";
type Mode = "signin" | "signup" | "forgot" | "reset";
const copy = {
  signin: ["Welcome back.", "Your team’s next idea is waiting.", "Sign in"],
  signup: [
    "Make room for great ideas.",
    "Create your account and start building together.",
    "Create account",
  ],
  forgot: [
    "Let’s get you back in.",
    "We’ll email you a link to reset your password.",
    "Send reset link",
  ],
  reset: [
    "A fresh start.",
    "Choose a new password for your account.",
    "Reset password",
  ],
};
export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [show, setShow] = useState(false);
  const [title, description, action] = copy[mode];
  const token = params.get("token");
  const hasPassword = mode !== "forgot";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    const password = String(fields.get("password") || "");
    if (mode === "reset" && password !== fields.get("confirmPassword")) {
      setMessage("Passwords do not match.");
      return;
    }
    if (
      (mode === "reset" || mode === "signup") &&
      new TextEncoder().encode(password).length > 72
    ) {
      setMessage("Use a password of at most 72 bytes.");
      return;
    }
    setBusy(true);
    setMessage("");
    const path = {
      signin: "/api/signin",
      signup: "/api/register",
      forgot: "/api/forgot-password",
      reset: `/api/reset-password/${encodeURIComponent(token || "")}`,
    }[mode];
    try {
      const data = await api<{
        msg?: string;
        token?: string;
        user?: { username: string };
      }>(path, {
        method: "POST",
        body: JSON.stringify({
          email: fields.get("email"),
          username: fields.get("username"),
          password,
        }),
      });
      if (mode === "signin" && data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user.username);
        window.dispatchEvent(new Event("storage"));
        const next = params.get("next");
        router.push(
          next && /^\/room\/[a-zA-Z0-9_-]{1,100}$/.test(next) ? next : "/",
        );
      } else {
        setSuccess(true);
        setMessage(data.msg || "Done. You’re ready for the next step.");
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout container">
      <aside className="auth-story">
        <span className="eyebrow">
          <GitBranch size={16} /> BETTER, TOGETHER
        </span>
        <h2>
          Good ideas grow
          <br />
          when you <span>share them.</span>
        </h2>
        <p>
          A focused place to pair up, work through a problem, and build
          something you’re proud of.
        </p>
        <div className="auth-note">
          <span className="status-dot" /> One room. A world of possibilities.
        </div>
      </aside>
      <section className="auth-card">
        <span className="eyebrow">YOUR CO-OP ACCOUNT</span>
        <h1>{title}</h1>
        <p>{description}</p>
        {success ? (
          <div className="success-state">
            <p className="notice success" role="status">
              {message}
            </p>
            <Link className="button primary full" href="/signin">
              Continue to sign in <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="form-stack">
            {mode === "signup" && (
              <div>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  minLength={2}
                  maxLength={40}
                  placeholder="How your team knows you"
                  required
                />
              </div>
            )}
            {mode !== "reset" && (
              <div>
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="you@example.com"
                  required
                />
              </div>
            )}
            {hasPassword && (
              <div>
                <div className="label-row">
                  <label htmlFor="password">
                    {mode === "reset" ? "New password" : "Password"}
                  </label>
                  {mode === "signin" && (
                    <Link href="/forgot-password">Forgot password?</Link>
                  )}
                </div>
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                    minLength={mode === "signin" ? 1 : 8}
                    maxLength={mode === "signin" ? 1024 : 72}
                    required
                    aria-describedby={
                      mode === "signin" ? undefined : "password-help"
                    }
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={show ? "Hide password" : "Show password"}
                    aria-pressed={show}
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode !== "signin" && (
                  <p className="caption" id="password-help">
                    Use at least 8 characters.
                  </p>
                )}
              </div>
            )}
            {mode === "reset" && (
              <div>
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={show ? "text" : "password"}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}
            {mode === "reset" && !token && (
              <p className="notice error" role="alert">
                This reset link is missing its token.{" "}
                <Link href="/forgot-password">Request a new link.</Link>
              </p>
            )}
            {message && (
              <p className="notice error" role="alert">
                {message}
              </p>
            )}
            <button
              className="button primary full"
              disabled={busy || (mode === "reset" && !token)}
            >
              {busy ? "Please wait…" : action}
              <ArrowRight size={18} />
            </button>
          </form>
        )}
        <div className="auth-links">
          {mode === "signin" ? (
            <>
              New here? <Link href="/signup">Create an account</Link>
            </>
          ) : mode === "signup" ? (
            <>
              Already have an account? <Link href="/signin">Sign in</Link>
            </>
          ) : (
            <Link href="/signin">← Back to sign in</Link>
          )}
        </div>
      </section>
    </div>
  );
}
