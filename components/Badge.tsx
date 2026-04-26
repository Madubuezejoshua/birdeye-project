import { TokenSignal } from "@/types";

interface BadgeProps {
  signal: TokenSignal;
  size?: "sm" | "md";
}

const CONFIG: Record<TokenSignal, { emoji: string; label: string; color: string }> = {
  HOT:     { emoji: "🔥", label: "HOT",     color: "bg-red-500 text-white border-red-500/40" },
  RISK:    { emoji: "⚠️", label: "RISK",    color: "bg-yellow-500 text-black border-yellow-500/40" },
  WATCH:   { emoji: "👀", label: "WATCH",   color: "bg-blue-500 text-white border-blue-500/40" },
};

export default function Badge({ signal, size = "sm" }: BadgeProps) {
  const { emoji, label, color } = CONFIG[signal];
  const padding = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${padding} ${color}`}>
      <span>{emoji}</span>
      <span>{label}</span>
    </span>
  );
}
