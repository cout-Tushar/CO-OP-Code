// TermsOfService.js (React JS - Dark Theme)
import React from "react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-[#58a6ff]">Terms of Service</h1>
        
        <p className="text-gray-300 mb-8 text-lg">
          Please read these Terms of Service carefully before using our platform.
        </p>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">1. Acceptance of Terms</h2>
          <p className="text-gray-300">
            By accessing or using our website, you agree to comply with and be bound by these Terms of Service.
          </p>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">2. User Responsibilities</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>You must provide accurate information during account creation.</li>
            <li>You are responsible for maintaining the confidentiality of your account.</li>
            <li>You agree not to misuse or exploit the platform.</li>
          </ul>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">3. Prohibited Activities</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li>Illegal or harmful activities.</li>
            <li>Uploading malicious code or scripts.</li>
            <li>Attempting to gain unauthorized access to systems.</li>
          </ul>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">4. Termination</h2>
          <p className="text-gray-300">
            We reserve the right to suspend or terminate your account if you violate these terms.
          </p>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">5. Limitation of Liability</h2>
          <p className="text-gray-300">
            We are not liable for any damages resulting from the use or inability to use our platform.
          </p>
        </section>

        <section className="mb-10 bg-[#161b22] p-6 rounded-2xl border border-[#30363d] shadow-lg">
          <h2 className="text-2xl font-semibold mb-3 text-[#58a6ff]">6. Updates to Terms</h2>
          <p className="text-gray-300">
            We may update these Terms of Service at any time. Continued use of the platform indicates your acceptance of the new terms.
          </p>
        </section>

        <p className="text-gray-400 mt-10 text-sm">
          If you have any questions regarding these terms, please contact our support team.
        </p>
      </div>
    </div>
  );
}
