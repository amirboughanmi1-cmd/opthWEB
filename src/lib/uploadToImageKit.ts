"use client";

/**
 * Client-side helper: upload a file to ImageKit via authenticated upload.
 *
 * 1. Asks /api/imagekit/auth for short-lived credentials (requires the admin's
 *    Supabase access token — the ImageKit PRIVATE key never leaves the server).
 * 2. POSTs the file directly to ImageKit with the public key + signature.
 * 3. Returns the delivered URL to store in Supabase (image_url, logo_url,
 *    brochure_url, pdf_url…).
 *
 * Transient network failures are retried with exponential backoff; auth and
 * validation errors fail fast (a retry would just fail again). ImageKit upload
 * tokens are single-use, so each attempt fetches fresh credentials.
 *
 * Works for images AND documents (PDF brochures) — ImageKit uses one endpoint.
 * `folder` groups uploads (e.g. "products", "brands", "brochures", "articles").
 */
import { getSupabaseBrowser } from "@/lib/supabase/client";

export interface ImageKitUploadResult {
  url: string;
  fileId: string;
  name: string;
}

const MAX_ATTEMPTS = 3;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function attemptUpload(file: File, folder?: string): Promise<ImageKitUploadResult> {
  // 1. Credentials from our API route (proves we're an authenticated admin).
  const supabase = getSupabaseBrowser();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Session expirée — reconnectez-vous.");

  const authRes = await fetch("/api/imagekit/auth", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!authRes.ok) {
    const body = await authRes.json().catch(() => null);
    throw new Error(body?.error ?? "Échec de l'authentification d'upload.");
  }
  const { token: ikToken, expire, signature, publicKey } = await authRes.json();

  // 2. Direct upload to ImageKit.
  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", publicKey);
  form.append("signature", signature);
  form.append("expire", String(expire));
  form.append("token", ikToken);
  form.append("useUniqueFileName", "true");
  if (folder) form.append("folder", folder);

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });
  if (!uploadRes.ok) {
    const body = await uploadRes.json().catch(() => null);
    throw new Error(body?.message ?? "Échec de l'upload ImageKit.");
  }

  // 3. Hand back the URL to store in Supabase.
  const data = await uploadRes.json();
  return {
    url: data.url as string,
    fileId: data.fileId as string,
    name: data.name as string,
  };
}

export async function uploadToImageKit(
  file: File,
  options: { folder?: string } = {},
): Promise<ImageKitUploadResult> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptUpload(file, options.folder);
    } catch (e) {
      lastErr = e;
      // Only retry transient network failures (fetch rejects with a TypeError).
      // Auth/validation errors are deterministic — surface them immediately.
      if (!(e instanceof TypeError) || attempt === MAX_ATTEMPTS) throw e;
      await wait(500 * attempt); // 0.5s → 1s backoff
    }
  }
  throw lastErr;
}
