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

export function ReplyIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M9 17l-5-5 5-5" />
      <path d="M4 12h11a5 5 0 0 1 5 5v1" />
    </svg>
  );
}

export function HomeIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M5.5 10.5V19a1 1 0 0 0 1 1H10v-4.5h4V20h3.5a1 1 0 0 0 1-1v-8.5" />
    </svg>
  );
}

export function MoreIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}

export function GearIcon({ className = "size-5" }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </svg>
  );
}
