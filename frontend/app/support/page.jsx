"use client"
import { motion } from "framer-motion";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full bg-[#161b22] rounded-2xl shadow-2xl p-10 border border-[#30363d]"
      >
        <h1 className="text-4xl font-bold text-center mb-4">Support</h1>
        <p className="text-gray-400 text-center mb-10">
          We're here to help! Choose a support option below.
        </p>

        <div className="grid grid-cols-1 gap-6">
          {/* Email Support */}
          <div className="p-6 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-blue-500 transition">
            <h2 className="text-2xl font-semibold mb-2 text-blue-400">📩 Email Support</h2>
            <p className="text-gray-400 mb-3">Send us your issue anytime.</p>
        <span>tusharmishra6666@gmail.com</span>
          </div>

          

          {/* FAQ */}
          <div className="p-6 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-blue-500 transition">
            <h2 className="text-2xl font-semibold mb-2 text-blue-400">📘 FAQs</h2>
            <p className="text-gray-400 mb-3">Find quick answers to common questions.</p>
            <a href="/faq" className="text-blue-500 underline hover:text-blue-400">
              Visit FAQ Page
            </a>
          </div>

          {/* Report Bug */}
          <div className="p-6 rounded-2xl bg-[#0d1117] border border-[#30363d] hover:border-blue-500 transition">
            <h2 className="text-2xl font-semibold mb-2 text-blue-400">🐛 Report a Bug</h2>
            <p className="text-gray-400 mb-3">Found a bug? Tell us so we can fix it quickly.</p>
           <span>tusharmishra6666@gmail.com</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}