interface LoaderProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-3",
};

export default function Loader({ text, size = "md" }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${sizes[size]} rounded-full border-gray-700 border-t-cyan-400 animate-spin`}
      />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}

/** Inline skeleton block for card placeholders */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gray-800 rounded-lg animate-pulse ${className}`} />
  );
}

/** Full-page loading overlay */
export function PageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader text={text} size="lg" />
    </div>
  );
}
