"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleCreateRoom = async () => {
    if (!isLoggedIn) {
      alert("Please log in to create a room.");
      router.push("/signin");
      return;
    }
    const response = await fetch(`${BACKEND_URL}/create-room`);
    const { roomId } = await response.json();
    router.push(`/room/${roomId}`);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleJoinRoom = () => {
    if (roomId.trim() === "") {
      alert("Please enter a room ID!");
      return;
    } else if (!isLoggedIn) {
      alert("Please log in to join a room.");
      router.push("/signin");
      return;
    }
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="back4.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        {/* Top Section - Hero & Form */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8 mb-8 lg:mb-0 lg:min-h-[50vh]">
          {/* Left: Typewriter Text Section */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-start bg-[#0d0f14]/70 p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl backdrop-blur-md min-h-[250px] sm:min-h-[300px]">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight select-none"
              style={{
                color: "#2A1B3D",
                textShadow: `
                  0 0 10px rgba(199,157,215,0.8),
                  0 0 20px rgba(199,157,215,0.6),
                  0 0 30px rgba(140,100,180,0.4),
                  0 0 40px rgba(90,70,130,0.3)
                `,
              }}
            >
              <Typewriter
                options={{
                  strings: ["CODE in CO-OP", "with CO-OP Code"],
                  autoStart: true,
                  loop: true,
                }}
              />
            </h1>
            <p
              className="mt-4 text-base sm:text-lg md:text-xl select-none"
              style={{
                color: "#bca7cc",
                textShadow:
                  "0 0 8px rgba(199,157,215,0.7), 0 0 15px rgba(199,157,215,0.5)",
              }}
            >
              Collaborate, code, and create — together.
            </p>
          </div>

          {/* Right: Join/Create Form */}
          <div className="flex flex-col items-center gap-4 w-full lg:w-1/3 bg-[#0d0f14]/70 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-md">
            <input
              type="text"
              placeholder="Enter Room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 sm:p-4 rounded-lg bg-[#161b22] text-white outline-none border border-gray-600 focus:border-blue-500 transition-colors text-sm sm:text-base"
            />
            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 sm:py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-500/50 text-sm sm:text-base"
            >
              Join Room
            </button>

            <div className="text-gray-400 text-sm">— or —</div>

            <button
              onClick={handleCreateRoom}
              className="w-full bg-green-600 hover:bg-green-700 py-3 sm:py-4 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-green-500/50 text-sm sm:text-base"
            >
              Create New Room
            </button>
          </div>
        </div>

        {/* Bottom Section - Features */}
        <div className="bg-black/50 flex justify-center items-center p-4 sm:p-6 lg:p-10 rounded-3xl backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10 w-full max-w-6xl">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center gap-3 bg-[#0d0f14]/60 p-5 sm:p-6 rounded-xl backdrop-blur-sm hover:bg-[#0d0f14]/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Real-time Coding</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Code together in perfect sync with live cursor tracking and instant updates</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center gap-3 bg-[#0d0f14]/60 p-5 sm:p-6 rounded-xl backdrop-blur-sm hover:bg-[#0d0f14]/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Team Collaboration</h3>
              <p className="text-gray-300 text-xs sm:text-sm">Invite unlimited team members and work together seamlessly</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center gap-3 bg-[#0d0f14]/60 p-5 sm:p-6 rounded-xl backdrop-blur-sm hover:bg-[#0d0f14]/80 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-green-500/30 md:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Instant Setup</h3>
              <p className="text-gray-300 text-xs sm:text-sm">No downloads required. Create a room and start coding in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}