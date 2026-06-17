/**
 * GET /api/health — liveness/readiness probe.
 *
 * Checks the two external dependencies the site relies on:
 *   - Supabase (a tiny public read, RLS-safe)
 *   - ImageKit  (HEAD the logo asset on the CDN)
 * Returns 200 {status:"ok"} when both respond, 503 {status:"degraded"} otherwise.
 * Useful for uptime monitors and Netlify health checks.
 */
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

// Always run live — never cache a health check.
export const dynamic = "force-dynamic";

const IK = (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? "https://ik.imagekit.io/rntjotcwu").replace(/\/$/, "");

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // ── Supabase ──
  // Note: this endpoint is public, so it returns only "ok"/"error" — never the
  // raw exception text (which can leak internal details). Full errors are logged.
  try {
    const { error } = await getSupabaseServer().from("brands").select("slug").limit(1);
    if (error) throw new Error(error.message);
    checks.database = "ok";
  } catch (e) {
    console.error("[health] database check failed:", e);
    checks.database = "error";
    healthy = false;
  }

  // ── ImageKit ──
  try {
    const r = await fetch(`${IK}/brand/ophtahealth-logo.webp`, {
      method: "HEAD",
      signal: AbortSignal.timeout(4000),
    });
    checks.imagekit = r.ok ? "ok" : "error";
    if (!r.ok) healthy = false;
  } catch (e) {
    console.error("[health] imagekit check failed:", e);
    checks.imagekit = "error";
    healthy = false;
  }

  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks, time: new Date().toISOString() },
    { status: healthy ? 200 : 503 },
  );
}
