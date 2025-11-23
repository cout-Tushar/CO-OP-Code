"use client";

import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [roomId, setRoomId] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // ✅ Load backend URL from env
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

  // -----------------------------------------
  // ✅ Create Room (uses token + env variable)
  // -----------------------------------------
  const handleCreateroom = async () => {
    if (!isLoggedIn) {
      alert("Please log in to create a room.");
      router.push("/signin");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BACKEND_URL}/create-room`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Failed to create room. Please try logging in again.");
        return;
      }

      const { roomId } = await res.json();
      router.push(`/room/${roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("Failed to create room");
    }
  };

  // -----------------------------------------
  // ✅ Join Room Handler
  // -----------------------------------------
  const handleJoinRoom = () => {
    if (!isLoggedIn) {
      alert("Please log in to join a room.");
      router.push("/signin");
      return;
    }
    setShowJoinModal(true);
  };

  const handleJoinSubmit = () => {
    if (roomId.trim() === "") {
      alert("Please enter a room ID!");
      return;
    }
    router.push(`/room/${roomId}`);
    setShowJoinModal(false);
  };

  // Detect scroll shadow
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check login status on route change
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  // Sync login status between tabs
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Recheck login on window focus
  useEffect(() => {
    const onFocus = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#0d0f14]/95 backdrop-blur-lg shadow-lg shadow-purple-500/10 border-b border-purple-500/20"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all duration-300"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-white font-bold text-lg">&lt;/&gt;</span>
                </div>
              </div>
              <span className="text-2xl font-bold">
                <span className="text-purple-400/70">&lt;</span>
                <span className="text-white group-hover:text-purple-300 transition-colors">
                  CO-OP
                </span>
                <span className="text-purple-400">/&gt;</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-1">
                  Code
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={handleCreateroom}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                <span className="relative z-10">Create Room</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </button>

              <button
                onClick={handleJoinRoom}
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                <span className="relative z-10">Join Room</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </button>

              <Link
                href="/docs"
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                Docs
              </Link>

              <Link
                href="/about"
                className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                About Us
              </Link>
            </nav>

            {/* Auth */}
            <div className="hidden md:flex items-center gap-3">
              {!isLoggedIn && (
                <Link
                  href="/signin"
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                >
                  Sign In
                </Link>
              )}

              {!isLoggedIn && (
                <Link
                  href="/signup"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200"
                >
                  Get Started
                </Link>
              )}

              {isLoggedIn && (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    setIsLoggedIn(false);
                    window.dispatchEvent(new Event("storage"));
                    router.push("/");
                  }}
                  className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile menu */}
            
          </div>
        </div>
      </header>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-[#0d0f14] border border-purple-500/20 rounded-2xl shadow-2xl p-8 w-96">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Join Room
            </h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleJoinSubmit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-lg font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200"
              >
                Join
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-20"></div>
    </>
  );
};

export default Header;
