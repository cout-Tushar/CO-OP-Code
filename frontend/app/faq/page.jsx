import ContentPage from "../Components/ContentPage";
export const metadata = { title: "Frequently asked questions" };
const faqs = [
  {
    q: "What is Coop Code?",
    a: "Coop Code is a real-time collaborative coding platform that allows users to code together, share rooms, chat, and build projects live using a fast and interactive interface.",
  },
  {
    q: "How does real-time collaboration work?",
    a: "We use WebSockets (Socket.IO) to sync code instantly between all connected users. Any change made in one editor reflects for everyone in real-time.",
  },
  {
    q: "Is Coop Code free to use?",
    a: "Yes! Coop Code is completely free. In the future, premium features may be added but the core collaborative tools will remain free.",
  },
  {
    q: "Can I invite friends to my room?",
    a: "Absolutely! Just share your room link. Anyone with the link can sign in, join and start coding with you.",
  },
  {
    q: "Which languages are supported?",
    a: "Currently, Coop Code supports front-end  and backend languages like java python C++. More language-specific features will be added soon.",
  },
  {
    q: "Who built Coop Code?",
    a: "Coop Code is developed by Tushar Mishra — a full-stack developer passionate about real-time applications and modern web development.",
  },
];

export default function FAQ() {
  return (
    <ContentPage
      title="A few good questions."
      description="Everything you need to find your flow with Co-op Code."
    >
      {faqs.map(({ q, a }) => (
        <details key={q}>
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </ContentPage>
  );
}
