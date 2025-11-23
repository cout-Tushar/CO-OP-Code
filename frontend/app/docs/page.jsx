

import React from "react";
import { BookOpen, Code, Server, ArrowRight } from "lucide-react";

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[#58a6ff]">
          Documentation
        </h1>
        <p className="text-gray-300 mb-10 text-lg">
          Learn how to set up, use, and contribute to the platform.
        </p>

        {/* Sections */}
        <div className="space-y-8">
          {/* Getting Started */}
          <section className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-[#58a6ff]" />
              <h2 className="text-2xl font-semibold">Getting Started</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Start your journey by understanding project setup and usage.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Install dependencies</li>
              <li>Configure environment variables</li>
              <li>Run frontend and backend servers</li>
            </ul>
          </section>

          {/* API Documentation */}
          <section className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Server className="text-[#58a6ff]" />
              <h2 className="text-2xl font-semibold">API Documentation</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Learn how your backend routes work and how to access them.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>User Authentication (Register / Login / Forgot Password)</li>
              <li>MongoDB models and validation</li>
              <li>Socket events for real-time collaboration</li>
            </ul>
          </section>

          {/* Code Collaboration */}
          <section className="bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Code className="text-[#58a6ff]" />
              <h2 className="text-2xl font-semibold">Live Code Collaboration</h2>
            </div>
            <p className="text-gray-400 mb-4">
              Understand how real-time updates work using Socket.io.
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Room creation and joining</li>
              <li>Broadcasting code changes</li>
              <li>Saving and syncing sessions</li>
            </ul>
          </section>

          {/* More */}
    
        </div>
      </div>
    </div>
  );
}
