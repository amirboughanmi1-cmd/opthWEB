/**
 * Server-side Supabase clients. Import only from Server Components,
 * API routes, or server actions — never from "use client" files.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Anonymous server client — public reads on server-rendered pages
 * (home, catalogue, produits/[slug], optique, occasion, sav).
 * Same RLS visibility as a visitor; no session persistence needed.
 */
export function getSupabaseServer(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Service-role client — BYPASSES RLS. Server-only escape hatch for API
 * routes that must write without a user session. Never expose its output
 * to the client without filtering.
 */
export function getSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
