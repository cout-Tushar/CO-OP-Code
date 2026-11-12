import Link from "next/link";
export default function ContentPage({
  title,
  eyebrow = "RESOURCES",
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="content-layout container">
      <aside className="content-nav">
        <span className="eyebrow">EXPLORE CO-OP</span>
        <nav aria-label="Resource pages">
          {[
            ["/docs", "Documentation"],
            ["/about", "About the project"],
            ["/faq", "Common questions"],
            ["/support", "Get support"],
            ["/privacy", "Privacy policy"],
            ["/terms", "Terms of service"],
            ["/cookies", "Cookies policy"],
          ].map(([href, label]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="content-tip">
          Better with company.
          <br />
          <Link className="text-link" href="/#start">
            Start a session ↗
          </Link>
        </div>
      </aside>
      <article className="content-article">
        <header className="content-heading">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </header>
        <div className="prose">{children}</div>
      </article>
    </div>
  );
}
