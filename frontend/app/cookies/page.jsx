// CookiesPolicy.js (React JS - Dark Theme)
import React from "react";

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[#58a6ff]">Cookies Policy</h1>

        <p className="text-gray-300 mb-8 text-lg">
          This Cookies Policy explains how we use cookies and similar technologies to
          improve your experience on our platform.
        </p>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">1. What Are Cookies?</h2>
          <p className="text-gray-300">
            Cookies are small text files stored on your device when you visit a website. They
            help the site function properly and improve your experience.
          </p>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">2. How We Use Cookies</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>To keep you logged in securely.</li>
            <li>To remember your preferences and settings.</li>
            <li>To analyze traffic and improve performance.</li>
          </ul>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">3. Types of Cookies We Use</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li><strong>Essential Cookies:</strong> Required for basic functionality.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform.</li>
            <li><strong>Preference Cookies:</strong> Store user settings and preferences.</li>
          </ul>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">4. Managing Cookies</h2>
          <p className="text-gray-300 mb-2">
            You can disable cookies through your browser settings. However, doing so may
            impact certain features of the platform.
          </p>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">5. Updates to This Policy</h2>
          <p className="text-gray-300">
            We may update this Cookies Policy as necessary. Continued use of the platform
            means you accept these changes.
          </p>
        </section>

        <p className="text-gray-400 mt-10 text-sm">
          If you have any questions about this Cookies Policy, feel free to contact us.
        </p>
      </div>
    </div>
  );
}