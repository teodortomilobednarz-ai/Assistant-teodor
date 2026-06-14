import { SparklesIcon } from "@/components/icons";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <span
      className={`bg-gradient-accent inline-flex items-center justify-center rounded-xl text-white shadow-sm ${className}`}
      aria-hidden
    >
      <SparklesIcon className="size-[60%]" />
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="size-8" />
      <span className="text-lg font-semibold tracking-tight">Draidly</span>
    </span>
  );
}
