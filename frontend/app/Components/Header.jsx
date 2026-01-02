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

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    router.push("/");
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2 sm:gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all duration-300"></div>
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span className="text-white font-bold text-base sm:text-lg">&lt;/&gt;</span>
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold">
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
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                <span className="relative z-10">Create Room</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </button>

              <button
                onClick={handleJoinRoom}
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                <span className="relative z-10">Join Room</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300"></div>
              </button>

              <Link
                href="/docs"
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                Docs
              </Link>

              <Link
                href="/about"
                className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200 relative group"
              >
                About Us
              </Link>
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {!isLoggedIn && (
                <>
                  <Link
                    href="/signin"
                    className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 lg:px-5 py-2 rounded-lg text-sm lg:text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </>
              )}

              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-purple-500/20 pt-4 space-y-2">
              <button
                onClick={() => {
                  handleCreateroom();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
              >
                Create Room
              </button>

              <button
                onClick={() => {
                  handleJoinRoom();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
              >
                Join Room
              </button>

              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
              >
                Docs
              </Link>

              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-purple-500/10 transition-all duration-200"
              >
                About Us
              </Link>

              <div className="pt-2 border-t border-purple-500/20 mt-2 space-y-2">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-center"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium text-center shadow-lg shadow-purple-500/25"
                    >
                      Get Started
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium text-center"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative bg-[#0d0f14] border border-purple-500/20 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Join Room
            </h2>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all mb-4 text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleJoinSubmit}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-3 rounded-lg font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                Join
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-16 sm:h-20"></div>
    </>
  );
};

export default Header;