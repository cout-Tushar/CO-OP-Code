"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
export default function Headerwrapper() {
  return usePathname().startsWith("/room/") ? null : <Header />;
}
