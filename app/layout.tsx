import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ApiUsageWidget from "@/components/ApiUsageWidget";
import ApiDebugPanel from "@/components/ApiDebugPanel";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Birdeye Intelligence Dashboard",
  description: "Real-time crypto intelligence — trending tokens, wallet analysis, and market insights",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
        <ApiUsageWidget />
        <ApiDebugPanel />
      </body>
    </html>
  );
}
