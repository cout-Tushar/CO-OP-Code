import Link from "next/link";
export default function NotFound() {
  return (
    <section className="empty-page">
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>A little off course.</h1>
      <p>This page doesn’t exist. Head home to start a new session.</p>
      <Link className="button primary" href="/">
        Back to home
      </Link>
    </section>
  );
}
