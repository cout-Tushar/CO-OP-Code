import type { Metadata } from "next";
import "./globals.css";
import Headerwrapper from "./Components/Headerwrapper";
import Footer from "./Components/Footer";
export const metadata: Metadata = {
  title: {
    default: "Co-op Code — Build together",
    template: "%s | Co-op Code",
  },
  description:
    "A shared space to edit, run, and discuss code together in your browser.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Headerwrapper />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
