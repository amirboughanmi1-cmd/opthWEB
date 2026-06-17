/**
 * POST /api/revalidate — on-demand ISR revalidation (hybrid strategy).
 *
 * After the admin dashboard writes to Supabase, it calls this route so the
 * statically-rendered public pages re-fetch fresh data immediately instead
 * of waiting for a timed revalidation.
 *
 * Body: { secret: string, paths?: string[] }
 * Defaults to refreshing every public surface when paths is omitted.
 */
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const DEFAULT_PATHS = [
  "/",
  "/catalogue",
  "/a-propos",
  "/optique",
  "/occasion",
  "/blog",
  "/blog/[slug]",
  "/produits/[slug]",
];

/** True when the request carries a valid Supabase admin session token. */
async function isAdminRequest(request: Request): Promise<boolean> {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return false;
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();
  return !!profile;
}

export async function POST(request: Request) {
  try {
    const { secret, paths } = (await request.json().catch(() => ({}))) as {
      secret?: string;
      paths?: string[];
    };

    // Authorized either by the shared secret (server-to-server) or by a
    // logged-in admin's Supabase token (dashboard after a write).
    const bySecret = !!process.env.REVALIDATE_SECRET && secret === process.env.REVALIDATE_SECRET;
    if (!bySecret && !(await isAdminRequest(request))) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const targets = paths?.length ? paths : DEFAULT_PATHS;
    for (const path of targets) {
      // Dynamic segments revalidate every rendered slug under the route.
      revalidatePath(path, path.includes("[") ? "page" : undefined);
    }
    // The navbar taxonomy lives in the root layout — refresh it across all routes.
    revalidatePath("/", "layout");

    return NextResponse.json({ revalidated: targets });
  } catch (e) {
    console.error("[api/revalidate]", e);
    return NextResponse.json({ error: "Échec de la revalidation." }, { status: 500 });
  }
}
