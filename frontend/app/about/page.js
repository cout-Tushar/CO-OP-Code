import ContentPage from "../Components/ContentPage";
export const metadata = { title: "About Co-op Code" };
export default function Page() {
  return (
    <ContentPage title="About Co-op Code" eyebrow="THE PROJECT">
      <p>
        <span>Coop Code</span> is a real-time collaborative coding platform
        designed to make pair-programming easy, fast, and fun. Built with modern
        technologies like <span>Next.js, Express, Socket.io, and MongoDB</span>,
        it allows multiple users to code together, share rooms, chat, and build
        projects instantly.
        <br />
        <br />
        Whether you&apos;re debugging with friends, teaching someone code, or
        building an idea together — Coop Code makes collaboration smooth with
        live updates, minimal delay, and a simple clean UI.
      </p>

      <h2>About the Developer</h2>
      <p>
        This project is created and developed by <span>Tushar Mishra</span> — a
        passionate full-stack developer who loves building real-time,
        interactive, and high-performance web applications. Always learning,
        always experimenting, and always building cool stuff 😎.
      </p>
    </ContentPage>
  );
}
