"use client";

import { usePathname } from "next/navigation";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

const Codespace = () => {

  const params = usePathname();
  const router = useRouter();
  const roomId = params.split("/")[2];

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize socket using env variable
  const socket = io(process.env.NEXT_PUBLIC_API_URL);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black`}
      >
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex justify-between items-center'>

            {/* Logo Section */}
            <Link href="/" className='group flex items-center gap-3'>
              <div className='relative'>
                <div className='absolute inset-0 bg-purple-500/20 blur-xl rounded-full group-hover:bg-purple-500/30 transition-all duration-300'></div>
                <div className='relative w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300'>
                  <span className='text-white font-bold text-lg'>&lt;/&gt;</span>
                </div>
              </div>
              <span className='text-2xl font-bold'>
                <span className='text-purple-400/70'>&lt;</span>
                <span className='text-white group-hover:text-purple-300 transition-colors'>CO-OP</span>
                <span className='text-purple-400'>/&gt;</span>
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 ml-1'>
                  Code
                </span>
              </span>
            </Link>

            <div
              className="h-[50px] w-[200px] bg-gradient-to-r from-purple-600 to-pink-600 border overflow-hidden border-gray-700 rounded-xl flex justify-center items-center text-xl font-bold cursor-pointer hover:bg-gradient-to-r hover:from-purple-800 hover:to-pink-800"
              onClick={() => navigator.clipboard.writeText(roomId)}
            >
              Copy Invite Code
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
                window.dispatchEvent(new Event("storage"));
                router.push("/");
              }}
              className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200 font-medium"
            >
              Logout
            </button>

          </div>
        </div>
      </header>

      {/* Spacer */}
      <div className="h-20"></div>
    </>
  );
};

export default Codespace;
