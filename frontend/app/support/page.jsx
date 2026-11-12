import Link from "next/link";
import { Mail, BookOpen, Bug } from "lucide-react";
import ContentPage from "../Components/ContentPage";
export const metadata = { title: "Support" };
export default function Support() {
  return (
    <ContentPage
      title="Let’s work it out."
      description="A question, a rough edge, or something unexpected? Start here."
    >
      <div className="resource-grid">
        <section className="resource-card">
          <Mail size={24} />
          <h2>Get in touch</h2>
          <p>Tell us what you need help with.</p>
          <a href="mailto:tusharmishra6666@gmail.com">
            tusharmishra6666@gmail.com ↗
          </a>
        </section>
        <section className="resource-card">
          <BookOpen size={24} />
          <h2>Find an answer</h2>
          <p>Get familiar with rooms, collaboration, and the editor.</p>
          <Link href="/faq">Browse common questions →</Link>
        </section>
        <section className="resource-card">
          <Bug size={24} />
          <h2>Report a bug</h2>
          <p>
            Include what happened, steps to reproduce it, and your browser.
            Leave out passwords, tokens, and private code.
          </p>
          <a href="mailto:tusharmishra6666@gmail.com?subject=Co-op%20Code%20bug%20report">
            Send a bug report ↗
          </a>
        </section>
        <section className="resource-card">
          <BookOpen size={24} />
          <h2>Get up to speed</h2>
          <p>A practical guide from your first room to running code.</p>
          <Link href="/docs">Read the documentation →</Link>
        </section>
      </div>
    </ContentPage>
  );
}
