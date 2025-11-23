"use client";
import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.msg || "Error registering user");
    } catch (err) {
      setMessage("Failed to connect to server.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      
      <div className="relative w-full max-w-md">
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30"></div>

        {/* Main card */}
        <div className="relative bg-[#0d0f14] border border-purple-500/20 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          
          <h1 className="text-3xl mb-6 font-bold text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Sign Up
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 
              focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 
              transition-all"
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 
              focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 
              transition-all"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700 
              focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 
              transition-all"
              required
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 
              hover:from-purple-500 hover:to-pink-500 py-3 rounded-lg font-semibold 
              shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 
              transform hover:scale-105 transition-all duration-200"
            >
              Sign Up
            </button>
          </form>

          {message && (
            <p
              className={`mt-4 text-sm text-center rounded-lg py-2 ${
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("created")
                  ? "text-green-400 bg-green-500/10 border border-green-500/20"
                  : "text-red-400 bg-red-500/10 border border-red-500/20"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
