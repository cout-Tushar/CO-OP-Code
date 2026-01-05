import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Headerwrapper from "./Components/Headerwrapper";
import Footer from "./Components/Footer";

import { Parkinsans } from "next/font/google";
import Script from "next/script";


const parkinsans = Parkinsans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Co-op Code",
  description: "Collaborative coding platform",
  icons:{
    icon: "/favicon.ico",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.lordicon.com/lordicon.js"></script>
      </head>
     
      <body
        className={`${geistSans.variable} ${geistMono.variable } antialiased ${parkinsans.className}`}
        
      >
        <Headerwrapper/>
        {children}
        <Footer/>


      </body>
    </html>
  );
}
