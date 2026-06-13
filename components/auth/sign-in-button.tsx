import { signInWithGoogle } from "@/lib/actions/auth";

import { GoogleIcon } from "./google-icon";

export function SignInButton({
  className = "",
  label = "Se connecter avec Google",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className={`inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-surface-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
      >
        <GoogleIcon className="size-5" />
        {label}
      </button>
    </form>
  );
}
