"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="empty-page">
      <span className="eyebrow">SOMETHING WENT WRONG</span>
      <h1>Let’s try that again.</h1>
      <p>We couldn’t load this page. Try refreshing to continue.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
      <Link className="text-link" href="/">
        Back to home
      </Link>
    </section>
  );
}
