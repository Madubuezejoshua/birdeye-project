"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Wallet, BarChart2, Bell, Zap } from "lucide-react";

const nav = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-400">Birdeye</span>
          <span className="text-white/60 font-normal text-sm">Intelligence</span>
        </Link>
        <div className="flex items-center gap-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                path === href
                  ? "bg-cyan-500/20 text-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
