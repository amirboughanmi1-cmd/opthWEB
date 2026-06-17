"use client";

/**
 * Admin auth via Supabase Auth (replaces the localStorage demo login).
 * Sessions, password hashing and refresh tokens are handled by supabase-js;
 * RLS write policies check the user against the `profiles` table server-side.
 */
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/** Sign in with email + password. Returns an error message, or null on success. */
export async function login(email: string, password: string): Promise<string | null> {
  const { error } = await getSupabaseBrowser().auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  return error ? error.message : null;
}

export async function logout() {
  await getSupabaseBrowser().auth.signOut();
}

/**
 * Reactive auth state.
 * `authed` is `null` while the session is being restored — guards must only
 * redirect on an explicit `false`, never on `null`.
 */
export function useAuth() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    sb.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { authed, login, logout };
}
