"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import Brand from "./Brand";
import { signOut, useSignedIn } from "@/lib/session";
export default function Header() {
  const [open, setOpen] = useState(false);
  const signedIn = useSignedIn();
  const path = usePathname();
  const router = useRouter();
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button
          className="icon-button mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={open ? "navigation is-open" : "navigation"}
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <Link href="/#start" onClick={close}>
            Create / join room
          </Link>
          {[
            ["/docs", "Documentation"],
            ["/about", "About"],
          ].map(([href, title]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              onClick={close}
            >
              {title}
            </Link>
          ))}
          <span className="nav-divider" />
          {signedIn ? (
            <button
              className="button secondary"
              onClick={() => {
                signOut();
                close();
                router.push("/");
              }}
            >
              Sign out
            </button>
          ) : (
            <>
              <Link href="/signin" onClick={close}>
                Sign in
              </Link>
              <Link href="/signup" className="button primary" onClick={close}>
                Get started ↗
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
