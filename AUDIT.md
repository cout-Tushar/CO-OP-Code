# Engineering review

## Baseline and priorities

Next.js 16 / React 19 App Router; Express 5, Socket.IO 4, Mongoose 8. Workflows: account registration, sign-in, recovery, room creation/join, shared editing/cursors, execution, download/copy and chat. Seven informational routes.

Initial frontend lint/build fail: dependencies absent (eslint/next not found). Root/server tests are placeholders. No environment files are present. Root/server node_modules are tracked in Git.

Highest priorities:

1. Unauthenticated HTTP/socket operations, spoofable usernames, missing membership and input checks, plaintext reset tokens and leaked internal errors.
2. Duplicate socket connections, browser globals during render, listeners/timers without disposal, no reconnect/rejoin, reset not broadcast, unbounded chat.
3. Inconsistent layouts/forms, inaccessible labels/navigation, fixed desktop workspace, missing loading/failure states.
4. 9,173,470-byte autoplay homepage video, three Google font families and unused global Lordicon script.

Preserve routes, payload fields, database schemas and invitation-based access. Add required JWT credentials to close the existing backend bypass of the UI's sign-in requirement. No new ownership model or production infrastructure changes. Verify with API/socket regression tests, lint/types/build, dependency audit and responsive browser review. Live MongoDB and email require a disposable configured environment.
