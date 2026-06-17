"use client";

/**
 * Browser-side Supabase client (singleton).
 *
 * Used by the admin dashboard (client-side CRUD) and any client component
 * that reads live data. The admin session is stored in sessionStorage, so it
 * ends when the browser/tab is closed — reopening requires a fresh login.
 *
 * Uses the anon key — every query is gated by Row Level Security:
 * public tables are readable, writes require an authenticated admin
 * (profiles row), leads are insertable anonymously.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          // sessionStorage (not localStorage): the admin session is dropped when
          // the browser/tab closes, so a left-open machine can't keep the panel
          // unlocked across restarts. Reopening requires logging in again.
          storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
        },
      },
    );
  }
  return client;
}
