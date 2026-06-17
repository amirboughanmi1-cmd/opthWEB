// Trim the transparent padding off the new eye-mark logo, add a small even
// margin, and upload it to ImageKit at brand/ophtahealth-logo.webp (overwrite).
import sharp from "sharp";
import { join } from "node:path";
import { getEnv, uploadBuffer, ROOT } from "./ik-upload.mjs";

const env = getEnv();
const src = join(ROOT, "..", "..", "Ophtaealth logo.webp");

// 1. Trim fully-transparent border → tight eye mark.
const trimmed = await sharp(src).trim().png().toBuffer();
const m = await sharp(trimmed).metadata();
console.log(`trimmed: ${m.width}x${m.height}`);

// 2. Add ~8% transparent margin so it isn't flush to the edges, cap height 400px.
const pad = Math.round(Math.max(m.width, m.height) * 0.08);
const out = await sharp(trimmed)
  .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ height: 400, withoutEnlargement: true })
  .webp({ quality: 92 })
  .toBuffer();
const fm = await sharp(out).metadata();
console.log(`final: ${fm.width}x${fm.height}, ${Math.round(out.length / 1024)}KB`);

// 3a. Save locally so the navbar/footer serve it from /public (no remote dep).
const { writeFileSync } = await import("node:fs");
writeFileSync(join(ROOT, "public", "brand", "ophtahealth-logo.webp"), out);
console.log("saved → public/brand/ophtahealth-logo.webp");

// 3b. Upload to ImageKit too (absolute URL for the OG/social card).
const r = await uploadBuffer(out, "ophtahealth-logo.webp", "brand", env, "image/webp");
console.log("uploaded →", r.url);
console.log("ASPECT", (fm.width / fm.height).toFixed(3));
