# Co-op Code frontend

Next.js App Router frontend with a shared dark design system, typed account/API components, and a lazy-loaded local Monaco editor.

See the [repository setup guide](../README.md) for configuration and commands, and the [implementation report](../IMPLEMENTATION_REPORT.md) for screen changes, verification results, and release limitations.

From this directory: `npm ci`, `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run format:check`, and `npm run build`.

Configure `.env.local` using `.env.example`. No secrets belong in `NEXT_PUBLIC_*` variables. Installation and builds run the guarded Monaco sanitizer preparation script described in the root guide.
