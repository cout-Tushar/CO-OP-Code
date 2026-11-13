# Co-op Code

A browser-based collaborative editor built with Next.js, React, Express, Socket.IO, and MongoDB. Sign in, create or join an invite-based room, edit a shared document, chat, run code, and download your work.

## Local setup

Tested with Node.js 22.18.0 and npm 10.9.3. Install each application independently; installed dependencies are intentionally excluded from Git.

```powershell
npm --prefix frontend ci
npm --prefix server ci
Copy-Item frontend/.env.example frontend/.env.local
Copy-Item server/.env.example server/.env
```

Configure `server/.env` before starting:

- `MONGO_URI`: a development MongoDB connection string. Do not point test work at production.
- `JWT_SECRET`: a cryptographically random secret of at least 32 characters. Existing deployments must retain their secure secret to keep issued tokens valid; no secret was changed by this refactor.
- `FRONTEND_URL`: allowed frontend origin, normally `http://localhost:3000`. A comma-separated list is supported; the first origin is used in reset emails. Required in production.
- `RESEND_API_KEY` and `RESEND_FROM`: email provider key and verified sending address. Without them, email recovery cannot deliver mail.
- `JUDGE0_API_URL`: base URL of a reachable [Judge0 CE instance](https://ce.judge0.com/docs), without `/submissions`. Use a separate runner host for production. If the instance requires an `X-Auth-Token`, set `JUDGE0_API_KEY` on the Express backend.
- For a live smoke test, set `JUDGE0_API_URL=https://ce.judge0.com` and restart the backend. Code submitted with Run is sent to the configured instance. In Java, use `public class Main` with a `main` method.
- Your `*.vercel.app` URL can be the reset link destination in `FRONTEND_URL`. Set `RESEND_FROM` to an address on a domain you control and verify in Resend for general delivery. The default `onboarding@resend.dev` sender is for testing with your Resend account email.
- `PORT`: defaults to 5000.

In `frontend/.env.local`, `NEXT_PUBLIC_API_URL` is the browser-reachable backend origin. `API_URL` is the backend origin used by the Next.js execution proxy. The defaults are `http://localhost:5000`. Public environment variables are embedded at build time; rebuild when changing them.

Run in separate terminals from the repository root:

```powershell
npm start
npm run dev
```

Visit `http://localhost:3000`. For the frontend production server:

```powershell
npm run build
npm --prefix frontend start
```

## Verification

```powershell
npm run lint
npm run typecheck
npm run format:check
npm test
npm --prefix server run check
npm run build
npm --prefix frontend audit --audit-level=low
npm --prefix server audit --audit-level=low
```

The 18 Node test-runner tests exercise real local HTTP and Socket.IO connections against dependency-injected in-memory model, mail, and execution doubles. They do not connect to MongoDB, send email, or execute untrusted code. Loopback connections and compiler child processes must be permitted by the execution environment.

`npm --prefix frontend run format` formats the frontend. The root formatting check also covers server application code and tests.

## Architecture and contracts

- `frontend/app`: existing routes, shared components, responsive styles, and the execution proxy.
- `frontend/lib`: typed API requests and shared browser session subscription.
- `server/app.js`: application factory, HTTP routes, middleware and injected service boundaries.
- `server/collaboration.js`: socket authentication, membership, event validation and per-room save ordering.
- `server/lib`: shared input validation and bounded per-process rate limiting.
- `server/routes/passwordReset.js`: hashed reset-token creation, mail handling and atomic token consumption.
- `server/model`: original MongoDB schemas, unchanged.
- `server/test`: isolated HTTP/socket/security regression coverage.

Existing endpoint paths and response fields remain. Room creation now requires `Authorization: Bearer <token>`. The frontend `/api/execute` proxy forwards the same credential to the backend. Socket clients provide `{ auth: { token } }`; room events retain their existing names and room/code/message fields. The server derives usernames from authenticated accounts and rejects events for rooms the socket has not joined. Optional acknowledgements return `{ ok, msg? }`.

Room invite codes still grant access to any signed-in user who knows the code. There is no separate room ownership or role schema. Chat is ephemeral; code is persisted per room. HTML/CSS remain editable and downloadable; execution is offered for JavaScript, Python, C++, and Java.

## Editor security and packaging

Monaco is loaded only inside a room and bundled locally with its language workers. It no longer loads a separate runtime copy from a CDN. Monaco 0.57.0 includes a vendored DOMPurify 3.4.15 file, so an npm override alone is insufficient: `frontend/scripts/prepare-monaco.mjs` replaces that entry with a re-export of the audited installed DOMPurify package. This guarded, repeatable preparation runs on installation, development and production builds. Review/remove the shim when upstream changes the sanitizer integration. The minimatch override is scoped to TypeScript ESLint's dependency tree; lint/type checks validate compatibility.

## Deployment limits

Read [IMPLEMENTATION_REPORT.md](IMPLEMENTATION_REPORT.md) before release. Production rollout requires configured MongoDB, Resend and Judge0 smoke tests, HTTPS/reverse-proxy verification, and a capacity and security review for the deployment topology.

The existing whole-document collaboration protocol is retained; concurrent edits are not merged by a CRDT/OT engine. Rate-limit counters and save queues are per process. Multi-instance operation needs coordinated room state, ordering and shared limiting. Keep a single backend instance until that work is designed and tested. Do not enable broad proxy trust; configure only verified proxy hops at the deployment boundary if needed.

JWTs remain in browser localStorage with a one-day lifetime. Logout clears the browser session; password resets do not revoke already issued tokens immediately. A cookie/session-revocation migration would require a separate authentication design and rollout.
