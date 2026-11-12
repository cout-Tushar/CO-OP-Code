"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Brand from "./Brand";
export default function Footer() {
  if (usePathname().startsWith("/room/")) return null;
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Brand />
          <p>A shared space for your next good idea.</p>
        </div>
        <nav aria-label="Resources">
          {[
            ["/docs", "Docs"],
            ["/about", "About"],
            ["/faq", "FAQ"],
            ["/support", "Support"],
          ].map(([url, label]) => (
            <Link key={url} href={url}>
              {label}
            </Link>
          ))}
          <a
            href="https://github.com/cout-Tushar/CO-OP-Code"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/tushar-mishra-1b15701ab/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn ↗
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Co-op Code · Built by Tushar Mishra
        </span>
        <nav aria-label="Legal">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/cookies">Cookies</Link>
        </nav>
      </div>
    </footer>
  );
}
