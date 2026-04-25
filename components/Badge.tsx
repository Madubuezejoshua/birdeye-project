import { TokenSignal } from "@/types";

interface BadgeProps {
  signal: TokenSignal;
  size?: "sm" | "md";
}

const CONFIG: Record<TokenSignal, { emoji: string; label: string; color: string }> = {
  HOT:     { emoji: "🔥", label: "HOT",     color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
  RISK:    { emoji: "⚠️", label: "RISK",    color: "text-red-400 bg-red-400/10 border-red-400/30" },
  WATCH:   { emoji: "👀", label: "WATCH",   color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  NEUTRAL: { emoji: "➖", label: "NEUTRAL", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
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
