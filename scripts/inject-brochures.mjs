// Compress every brochure in /brochure (PDF → Ghostscript /ebook, image → sharp),
// upload to ImageKit /brochures/<slug>, and set products.brochure_url in the client DB.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, mkdirSync, existsSync, statSync, rmSync } from "node:fs";
import { join, extname } from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";
import { getEnv, uploadBuffer, ROOT } from "./ik-upload.mjs";

const env = getEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const BROCH_DIR = join(ROOT, "..", "..", "brochure");
const TMP = join(ROOT, ".brochure-tmp");
mkdirSync(TMP, { recursive: true });

// brochure filename → product slug (slugs verified against the live DB)
const MAP = {
  "ACP 800.png": "acp-800",
  "ACP1000.png": "acp-1000",
  "Activa .pdf": "activa",
  "Brochure-REM-4000.pdf": "rem-4000",
  "Brochure-ZULU3.pdf (1).pdf": "zulu-3",
  "CFC-X PORTABLE FUNDUS CAMERA.pdf": "cfc-x",
  "Colombo-IOL-II.pdf": "colombo-iol-ii",
  "DSLC200.pdf": "dslc200",
  "DeltaQp.pdf": "delta-qp",
  "Drone 4 2025.pdf": "drone4",
  "ELITE.pdf": "elite",
  "FundusScope.pdf": "fundusscope",
  "Mocean 4000 Brochure 2024.pdf": "mocean-4000",
  "Moptim easyRef brochure En 2021.9.pdf": "easyref-pro",
  "NT-700.pdf": "nt-700",
  "OS1000.pdf": "os1000",
  "Phoromat_2000.pdf": "phoromat-2000",
  "Pi MODEL EYE OPERATION TABLE (1).pdf": "pi-mabel",
  "RB-800 Rebound Tonometer Brochure.pdf": "rb-800",
  "RetiCam 3100.pdf": "reticam-3100",
  "SVF-7000.pdf": "svf-7000",
  "SW-21 DELTA SCAN with JACK KANE.pdf": "sw-21-delta",
  "Slit Lamp SL-1S - SL-2S - SL-3S 2024.pdf": "sl-1s",
  "VT-700A.jpg": "vt-700a",
  "VT800.jpg": "vt-800",
  "_TopaScope_brochure_.pdf": "topascope",
  "al6600.pdf": "al-6600",
  "alino.pdf": "alino",
  "cv600.pdf": "cv-600",
  "idra.pdf": "idra",
  "peristat 2.pdf": "peristat-2",
  "pro 500.pdf": "pro500",
  "retiwave 1000.pdf": "retiwave-1000",
  "rodachart422.pdf": "rodachart-422",
  "rsl 4500.pdf": "rsl-4500",
  "rsl2600.pdf": "rsl-2600",
  "sw 800.pdf": "sw-800",
};

// Resolve the Ghostscript binary (Windows uses gswin64c, not gs).
function resolveGs() {
  const cands = ["gswin64c", "gs"];
  try {
    const base = "C:\\Program Files\\gs";
    for (const d of readdirSync(base)) cands.push(join(base, d, "bin", "gswin64c.exe"));
  } catch { /* not installed there */ }
  for (const c of cands) {
    try { execFileSync(c, ["--version"], { stdio: "ignore" }); return c; } catch { /* next */ }
  }
  return null;
}
const GS = resolveGs();
if (!GS) console.warn("⚠ Ghostscript not found — PDFs uploaded uncompressed");
else console.log(`Ghostscript: ${GS}`);

function compressPdf(inPath, outPath) {
  execFileSync(GS, [
    "-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4", "-dPDFSETTINGS=/ebook",
    "-dDetectDuplicateImages=true", "-dNOPAUSE", "-dBATCH", "-dQUIET",
    "-sOutputFile=" + outPath, inPath,
  ], { stdio: "ignore" });
}

const mb = (b) => (b / 1024 / 1024).toFixed(2);
let done = 0;
const entries = Object.entries(MAP);
for (const [file, slug] of entries) {
  const inPath = join(BROCH_DIR, file);
  if (!existsSync(inPath)) { console.log(`MISSING ${file}`); continue; }
  const ext = extname(file).toLowerCase();
  const orig = statSync(inPath).size;
  let buf, outName, ct;

  if (ext === ".pdf") {
    outName = slug + ".pdf";
    ct = "application/pdf";
    const outPath = join(TMP, outName);
    if (GS) { try { compressPdf(inPath, outPath); } catch { /* keep original */ } }
    buf = existsSync(outPath) && statSync(outPath).size > 0 && statSync(outPath).size < orig
      ? readFileSync(outPath) : readFileSync(inPath);
  } else {
    // image brochure (ACP / VT) → resize-down + recompress
    const img = sharp(inPath).resize({ width: 1600, withoutEnlargement: true });
    if (ext === ".png") { buf = await img.png({ compressionLevel: 9, quality: 82 }).toBuffer(); outName = slug + ".png"; ct = "image/png"; }
    else { buf = await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer(); outName = slug + ".jpg"; ct = "image/jpeg"; }
    if (buf.length >= orig) buf = readFileSync(inPath); // don't upload a bigger file
  }

  const r = await uploadBuffer(buf, outName, "brochures", env, ct);
  const { error } = await sb.from("products").update({ brochure_url: r.url }).eq("slug", slug);
  done++;
  console.log(`${String(done).padStart(2)}/${entries.length}  ${slug.padEnd(28)} ${mb(orig)}→${mb(buf.length)}MB  ${error ? "DB-ERR " + error.message : "ok"}`);
}

rmSync(TMP, { recursive: true, force: true });
console.log(`\nUploaded ${done} brochures. Products WITHOUT a brochure: chaufferette-optique, meuleuse-automatique-hpe-410, meuleuse-manuelle, pack-9-pinces-6-tournevis, pupillometre-digital, rmk-700 (6).`);
