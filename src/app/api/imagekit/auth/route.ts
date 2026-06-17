/**
 * POST /api/imagekit/auth — short-lived upload credentials for the admin dashboard.
 *
 * Flow: admin picks a file → frontend calls this route → we return ImageKit's
 * { token, expire, signature } (HMAC-SHA1 of token+expire with the PRIVATE key,
 * server-only) → frontend uploads the file straight to ImageKit with the public
 * key + signature → ImageKit returns the URL → stored in Supabase.
 *
 * Only an authenticated admin may obtain credentials: the request must carry the
 * Supabase access token, verified and matched against the profiles table.
 */
import { createHmac, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // ── Auth: Supabase JWT → must map to a profiles row (admin) ──
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    // ── Build ImageKit upload credentials ──
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
    if (!privateKey || !publicKey) {
      return NextResponse.json({ error: "Configuration ImageKit manquante." }, { status: 500 });
    }

    const uploadToken = randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 600; // 10 min (ImageKit max 1h)
    const signature = createHmac("sha1", privateKey).update(uploadToken + expire).digest("hex");

    return NextResponse.json({ token: uploadToken, expire, signature, publicKey });
  } catch (e) {
    // Never leak a stack trace to the client; log server-side, return a clean 500.
    console.error("[api/imagekit/auth]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
