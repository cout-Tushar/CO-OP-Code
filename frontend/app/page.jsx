"use client";

import { useRouter } from "next/navigation";
import { useState,useEffect } from "react";
import Typewriter from "typewriter-effect";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
  const handleCreateRoom = async () => {
    const response = await fetch(`${BACKEND_URL}/create-room`);
    const { roomId } = await response.json();
    if(!isLoggedIn) {
      alert("Please log in to create a room.");
      router.push("/signin");
     
      return;
    }
    router.push(`/room/${roomId}`);
  };
  console.log(isLoggedIn);

    useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token); // true if token exists
  }, []);


  const handleJoinRoom = () => {
    if (roomId.trim() === "") {
      alert("Please enter a room ID!");
      return;
    }
    else if (!isLoggedIn) {
      router.push("/signin");
      alert("Please log in to join a room.");
      return;
    }
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="back4.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Foreground content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Top Half */}
        <div className="flex flex-row justify-between items-center h-1/2 px-12 gap-6">

          {/* Left: Typewriter Text Section */}
          <div className="w-1/2 flex flex-col justify-between items-start bg-[#0d0f14]/70 p-10 rounded-2xl shadow-2xl backdrop-blur-md h-[300px]">
            <h1
              className="text-5xl md:text-7xl font-extrabold leading-tight select-none"
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
              className="mt-4 text-lg select-none"
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
          <div className="flex flex-col items-center gap-4 w-1/3 bg-[#0d0f14]/70 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
            <input
              type="text"
              placeholder="Enter Room ID..."
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#161b22] text-white outline-none border border-gray-600"
            />
            <button
              onClick={handleJoinRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-medium transition"
            >
              Join Room
            </button>

            <div className="text-gray-400">— or —</div>

            <button
              onClick={handleCreateRoom}
              className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition"
            >
              Create New Room
            </button>
          </div>
        </div>

        {/* Bottom Half - Features Section */}
        <div className="h-1/2 bg-black/50 m-3.5 flex justify-center items-center p-10 rounded-3xl">
          <div className="grid grid-cols-3 gap-10 w-full max-w-5xl">
            
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center gap-3 bg-[#0d0f14]/60 p-6 rounded-xl backdrop-blur-sm hover:bg-[#0d0f14]/80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Real-time Coding</h3>
              <p className="text-gray-300 text-sm">Code together in perfect sync with live cursor tracking and instant updates</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center gap-3 bg-[#0d0f14]/60 p-6 rounded-xl backdrop-blur-sm hover:bg-[#0d0f14]/80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Team Collaboration</h3>
              <p className="text-gray-300 text-sm">Invite unlimited team members and work together seamlessly</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center gap-3 bg-[#0d0f14]/60 p-6 rounded-xl backdrop-blur-sm hover:bg-[#0d0f14]/80 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Instant Setup</h3>
              <p className="text-gray-300 text-sm">No downloads required. Create a room and start coding in seconds</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}