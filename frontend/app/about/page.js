"use client";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">

      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgNHYyaC0ydi0yaDJ6bTAtNHYyaC0ydi0yaDJ6bS00IDR2MmgtMnYtMmgyek0yOCAzMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative w-full max-w-3xl">

        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30"></div>

        {/* Main card */}
        <div className="relative bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-gray-700/50">
          
          <h1 className="text-4xl font-bold text-white text-center mb-6">
            About <span className="text-purple-400">Coop Code</span>
          </h1>

          <p className="text-gray-300 leading-relaxed text-lg mb-8">
            <span className="font-semibold text-purple-300">Coop Code</span> is a real-time
            collaborative coding platform designed to make pair-programming easy, fast,
            and fun. Built with modern technologies like{" "}
            <span className="text-purple-300">Next.js, Express, Socket.io, and MongoDB</span>,
            it allows multiple users to code together, share rooms, chat, and build
            projects instantly.
            <br /><br />
            Whether you're debugging with friends, teaching someone code, or building an
            idea together — Coop Code makes collaboration smooth with live updates,
            minimal delay, and a simple clean UI.
          </p>

          <h2 className="text-3xl font-bold text-white mb-4">About the Developer</h2>
          <p className="text-gray-300 leading-relaxed text-lg mb-8">
            This project is created and developed by{" "}
            <span className="text-purple-300 font-semibold">Tushar Mishra</span> — a
            passionate full-stack developer who loves building real-time, interactive,
            and high-performance web applications. Always learning, always experimenting,
            and always building cool stuff 😎.
          </p>

          <div className="flex justify-center">
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
