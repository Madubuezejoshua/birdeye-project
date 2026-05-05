"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Wallet, Bell, Trophy } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/rewards", label: "Rewards", icon: Trophy },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-white hover:opacity-80 transition-opacity">
          {/* Logo mark */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-500">
            <span className="text-black font-black text-sm">U</span>
          </div>
          <span className="text-white text-lg font-bold tracking-tight">Upsite</span>
          <span className="hidden sm:block text-gray-600 text-xs font-normal mt-0.5">Wallet Intelligence</span>
        </Link>

        <div className="flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                path === href
                  ? "bg-green-500/20 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
