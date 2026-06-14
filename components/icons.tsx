/**
 * Small, consistent stroke icons (24×24, currentColor). Presentational only.
 */
type IconProps = { className?: string };

function base(className: string) {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

export function SparklesIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4L12 3z" />
      <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7L19 14z" />
    </svg>
  );
}

export function MailIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export function CalendarIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  );
}

export function FileIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M14 3.5H7.5A2.5 2.5 0 0 0 5 6v12a2.5 2.5 0 0 0 2.5 2.5h9A2.5 2.5 0 0 0 19 18V8.5L14 3.5z" />
      <path d="M14 3.5V8.5h5M8.5 13h7M8.5 16.5h7" />
    </svg>
  );
}

export function ChecksIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3.5 12.5l3 3 6-7M13 15.5l2 2 6-7" />
    </svg>
  );
}

export function SearchIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ShieldIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function BoltIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8z" />
    </svg>
  );
}

export function ReceiptIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 3h12v18l-3-1.5L12 21l-3-1.5L6 21V3z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function CheckIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 12.5l4.5 4.5L19 6.5" />
    </svg>
  );
}

export function TrashIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13" />
    </svg>
  );
}

export function ClockIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function PaperclipIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9 14.8a1.6 1.6 0 0 1-2.3-2.3l7.3-7.3" />
    </svg>
  );
}

export function MenuIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function XIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function HomeIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 11.5L12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-8.5z" />
    </svg>
  );
}
