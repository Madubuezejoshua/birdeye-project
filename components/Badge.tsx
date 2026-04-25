import { TokenSignal } from "@/types";

interface BadgeProps {
  signal: TokenSignal;
  size?: "sm" | "md";
}

const CONFIG: Record<TokenSignal, { emoji: string; label: string; color: string }> = {
  HOT:     { emoji: "🔥", label: "HOT",     color: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  RISK:    { emoji: "⚠️", label: "RISK",    color: "bg-red-500/20 text-red-300 border-red-500/40" },
  WATCH:   { emoji: "👀", label: "WATCH",   color: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  NEUTRAL: { emoji: "➖", label: "NEUTRAL", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
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
