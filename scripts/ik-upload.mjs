// Shared helper: read .env.local and upload LOCAL files (Buffer) to ImageKit.
// Uses the private key (Basic auth) — server-side only, never shipped to the client.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Disable undici's header/body timeouts for big uploads (best-effort).
try {
  const undici = await import("undici");
  undici.setGlobalDispatcher(new undici.Agent({ headersTimeout: 0, bodyTimeout: 0, connectTimeout: 60_000 }));
} catch { /* undici not importable — rely on retries below */ }

export function getEnv() {
  const env = {};
  for (const line of readFileSync(join(ROOT, ".env.local"), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  if (!env.IMAGEKIT_PRIVATE_KEY) throw new Error("IMAGEKIT_PRIVATE_KEY missing in .env.local");
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("Supabase env missing in .env.local");
  return env;
}

/**
 * Upload a Buffer to ImageKit at folder/fileName, overwriting any existing file
 * (stable URL, cache purged). Retries transient network failures. Returns the
 * parsed JSON ({ url, filePath, ... }).
 */
export async function uploadBuffer(buf, fileName, folder, env, contentType, attempt = 1) {
  const auth = "Basic " + Buffer.from(env.IMAGEKIT_PRIVATE_KEY + ":").toString("base64");
  try {
    const fd = new FormData();
    fd.append("file", new Blob([buf], contentType ? { type: contentType } : undefined), fileName);
    fd.append("fileName", fileName);
    fd.append("folder", folder);
    fd.append("useUniqueFileName", "false");
    fd.append("overwriteFile", "true");
    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: auth },
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`IK upload ${folder}/${fileName} → ${res.status} ${JSON.stringify(json)}`);
    return json;
  } catch (e) {
    if (attempt < 4) {
      await new Promise((r) => setTimeout(r, 2000 * attempt));
      return uploadBuffer(buf, fileName, folder, env, contentType, attempt + 1);
    }
    throw e;
  }
}
