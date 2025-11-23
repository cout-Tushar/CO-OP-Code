"use client";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgNHYyaC0ydi0yaDJ6bTAtNHYyaC0ydi0yaDJ6bS00IDR2MmgtMnYtMmgyek0yOCAzMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>

      <div className="relative w-full max-w-3xl">

        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30"></div>

        {/* Main card */}
        <div className="relative bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-gray-700/50">

          <h1 className="text-4xl font-bold text-white mb-6 text-center">
            Privacy <span className="text-purple-400">Policy</span>
          </h1>

          <p className="text-gray-300 leading-relaxed mb-6">
            This Privacy Policy explains how Coop Code collects, uses, and protects the information of its users. By using our platform, you agree to the terms described in this policy.
          </p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">1. Information We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              When you sign up or use Coop Code, we may collect:
              <br />• Name and email address  
              <br />• Login details  
              <br />• Real-time editor content (code you write)  
              <br />• Basic usage and activity logs  
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">2. How We Use Your Data</h2>
            <p className="text-gray-300 leading-relaxed">
              We use your information to:
              <br />• Provide real-time collaboration  
              <br />• Improve platform performance  
              <br />• Maintain account security  
              <br />• Enhance user experience and add new features  
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">3. Data Security</h2>
            <p className="text-gray-300 leading-relaxed">
              Your data is stored securely using modern cloud infrastructure and encrypted connections.  
              We take all reasonable measures to protect your information from unauthorized access.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">4. Sharing of Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We do <span className="text-purple-400 font-semibold">not</span> sell or share your personal information with third parties except:
              <br />• When legally required  
              <br />• To protect platform security  
              <br />• To provide essential service features (e.g., hosting providers)  
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">5. Cookies & Tracking</h2>
            <p className="text-gray-300 leading-relaxed">
              Coop Code may use cookies to keep you logged in, remember preferences, and analyze usage — only to improve the platform experience.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">6. Your Rights</h2>
            <p className="text-gray-300 leading-relaxed">
              You can request to:
              <br />• Delete your account  
              <br />• Remove your data  
              <br />• Update personal information  
              <br />• Access your saved information  
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">7. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              For any privacy-related questions, you can reach out to the developer:  
              <br />
              <span className="text-purple-400 font-semibold">Tushar Mishra</span>
            </p>
          </section>

          <div className="flex justify-center mt-8">
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
