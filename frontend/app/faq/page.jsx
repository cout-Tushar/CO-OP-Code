"use client";
import { useState } from "react";
import Link from "next/link";

export default function FAQ() {
  const [open, setOpen] = useState(null);

  const toggle = (i) => {
    setOpen(open === i ? null : i);
  };

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
      a: "Absolutely! Just share your room link. Anyone with the link can join instantly and start coding with you.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgNHYyaC0ydi0yaDJ6bTAtNHYyaC0ydi0yaDJ6bS00IDR2MmgtMnYtMmgyek0yOCAzMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative w-full max-w-3xl">
        
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30"></div>

        {/* Main card */}
        <div className="relative bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-gray-700/50">

          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Frequently Asked <span className="text-purple-400">Questions</span>
          </h1>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-gray-700 rounded-lg bg-gray-700/30">
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center px-5 py-4 text-left text-white font-medium hover:bg-gray-700/50 transition-all"
                >
                  {faq.q}
                  <span className="text-purple-400">{open === i ? "-" : "+"}</span>
                </button>

                {open === i && (
                  <div className="px-5 py-4 text-gray-300 bg-gray-800/40 border-t border-gray-700 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
