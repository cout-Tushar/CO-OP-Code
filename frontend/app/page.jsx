import Link from "next/link";
import {
  ArrowUpRight,
  Radio,
  MessageSquare,
  Terminal,
  GitBranch,
  Check,
} from "lucide-react";
import RoomActions from "./Components/RoomActions";
export default function HomePage() {
  return (
    <div className="home container">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" /> A SHARED SPACE FOR DEVELOPERS
          </div>
          <h1>
            Different minds.
            <br />
            One <span>great build.</span>
          </h1>
          <p className="hero-description">
            Close the distance between an idea and working code. Edit, run, and
            figure things out together — right in your browser.
          </p>
          <div className="hero-details">
            <span>
              <Check size={15} /> Live collaboration
            </span>
            <span>
              <Check size={15} /> No setup required
            </span>
          </div>
          <Link className="text-link" href="/docs">
            See how it works <ArrowUpRight size={17} />
          </Link>
        </div>
        <RoomActions />
      </section>
      <section
        className="product-preview"
        aria-label="An example collaborative coding session"
      >
        <div className="preview-top">
          <span className="window-dots" aria-hidden="true">
            ● ● ●
          </span>
          <span>
            the next great idea / <strong>main.js</strong>
          </span>
          <span className="preview-live">
            <Radio size={14} /> Built to be shared
          </span>
        </div>
        <div className="preview-body">
          <div className="preview-code">
            <div className="file-tab">
              <span className="js-badge">JS</span> main.js{" "}
              <span className="muted">×</span>
            </div>
            <pre>
              <code>
                <span className="comment">
                  {"// A little collaboration goes a long way."}
                </span>
                {"\n\n"}
                <span className="purple">const</span> team = [
                <span className="green">&quot;you&quot;</span>,{" "}
                <span className="green">
                  &quot;your next collaborator&quot;
                </span>
                ];{"\n\n"}
                <span className="purple">function</span>{" "}
                <span className="blue">buildTogether</span>(idea) {"{"}
                {"\n"} <span className="purple">return</span> team.
                <span className="blue">map</span>(developer =&gt; {"{"}
                {"\n"} <span className="purple">return</span> developer +{" "}
                <span className="green">&quot; + &quot;</span> + idea;{"\n"}{" "}
                {"}"});{"\n"}
                {"}"}
                {"\n\n"}
                <span className="blue">buildTogether</span>(
                <span className="green">&quot;something great&quot;</span>);
                <span className="sample-cursor" aria-hidden="true" />
              </code>
            </pre>
            <div className="preview-status">
              <span>
                <GitBranch size={13} /> shared session
              </span>
              <span>JavaScript · UTF-8</span>
            </div>
          </div>
          <div className="preview-aside">
            <span className="eyebrow">LESS FRICTION. MORE FLOW.</span>
            <h3>
              Your editor.
              <br />
              Your team.
              <br />
              Same page.
            </h3>
            <p>
              One room for the code, the conversation, and that moment it all
              clicks.
            </p>
            <div className="avatar-stack" aria-hidden="true">
              <span>Y</span>
              <span>T</span>
              <span>+</span>
            </div>
          </div>
        </div>
      </section>
      <section className="features" aria-label="Platform features">
        {[
          [
            Radio,
            "01",
            "Stay in sync",
            "Shared code and live cursors keep everyone in the conversation.",
          ],
          [
            MessageSquare,
            "02",
            "Talk it through",
            "Keep ideas and feedback next to your code with built-in room chat.",
          ],
          [
            Terminal,
            "03",
            "Make it run",
            "Try your code, inspect the output, and download what you build.",
          ],
        ].map(([Icon, number, title, description]) => (
          <article key={title}>
            <div className="feature-top">
              <Icon size={21} />
              <span>{number}</span>
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
