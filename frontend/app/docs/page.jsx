import Link from "next/link";
import ContentPage from "../Components/ContentPage";
export const metadata = { title: "Documentation" };
export default function Documentation() {
  return (
    <ContentPage
      title="From idea to shared code."
      description="A short guide to getting your team into the same room."
    >
      <section>
        <span className="eyebrow">01 / GET STARTED</span>
        <h2>A room of your own</h2>
        <p>
          <Link href="/signup">Create an account</Link> or sign in, then choose
          Create a room on the homepage. Already invited? Paste the invite code
          into the join field, or open the room link.
        </p>
      </section>
      <section>
        <span className="eyebrow">02 / COLLABORATE</span>
        <h2>Bring your team along</h2>
        <p>
          Use Copy invite in the workspace to share your room code. Signed-in
          collaborators can join, edit the same document, see live cursors, and
          talk in the room chat. Anyone with the invite can access the room, so
          share it only with people you trust.
        </p>
        <p>
          Edits sync while connected and are saved to the server. Watch the
          connection and save status before leaving. If your connection drops,
          editing pauses until the room rejoins. Download a copy to keep a local
          backup.
        </p>
      </section>
      <section>
        <span className="eyebrow">03 / BUILD & RUN</span>
        <h2>Try something out</h2>
        <p>
          Select JavaScript, Python, C++, or Java and choose Run code. The
          output panel shows execution results or a useful error. HTML and CSS
          can be edited and downloaded; they do not run in the code execution
          service.
        </p>
        <p>
          Copy, download, or reset your code from the toolbar. Reset changes the
          shared document for everyone. Chat messages belong to the current
          session and are not stored when you leave.
        </p>
      </section>
      <section>
        <span className="eyebrow">FOR CONTRIBUTORS</span>
        <h2>Project setup and API</h2>
        <p>
          The project uses Next.js, Express, Socket.IO, and MongoDB. Install
          frontend and server dependencies, configure the example environment
          files, and start both services. See the repository README for exact
          commands and validation steps.
        </p>
        <ul>
          <li>Authentication: register, sign in, and recover a password.</li>
          <li>MongoDB models: user accounts and a saved document per room.</li>
          <li>
            Socket events: room membership, code changes, cursors, and chat.
          </li>
          <li>
            Authenticated HTTP requests use a Bearer token; sockets pass the
            same token in their authentication handshake.
          </li>
        </ul>
        <Link
          href="https://github.com/cout-Tushar/CO-OP-Code"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explore the source ↗
        </Link>
      </section>
    </ContentPage>
  );
}
