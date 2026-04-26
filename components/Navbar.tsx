"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Wallet, BarChart2, Bell, Zap } from "lucide-react";
import Image from "next/image";

const nav = [
  { href: "/", label: "Dashboard", icon: Activity },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="border-b border-white/10 bg-gray-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/" className="flex items-center gap-3 font-bold text-white hover:opacity-80 transition-opacity">
          {/* Logo Container - Properly Centered */}
          <div className="flex items-center justify-center w-10 h-10 relative bg-white/5 rounded-lg border border-white/10">
            <Image
              src="/logo.png"
              alt="Birdeye Logo"
              width={28}
              height={28}
              style={{ width: 28, height: 28, objectFit: "contain" }}
              className="rounded"
              priority
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Fallback Icon */}
            <Zap className="w-6 h-6 text-cyan-400 fallback-icon hidden absolute" />
          </div>
          
          {/* Website Name - Properly Aligned */}
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-lg font-bold">Birdeye</span>
            <span className="text-white/70 font-normal text-sm">Intelligence</span>
          </div>
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
