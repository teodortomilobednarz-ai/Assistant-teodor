import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Lightweight liveness probe for uptime monitors (no DB hit). */
export function GET() {
  return NextResponse.json({ status: "ok", service: "draidly" });
}
