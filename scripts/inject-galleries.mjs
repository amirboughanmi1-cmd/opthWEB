// Upload each product's photo folder to ImageKit (products/gallery/<slug>/<n>),
// then set products.image_url = folder cover and products.images = the rest.
// Run AFTER add-images-column.sql has been applied on the client DB.
import sharp from "sharp";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getEnv, uploadBuffer, ROOT } from "./ik-upload.mjs";

const env = getEnv();
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});
const PHOTOS = join(ROOT, "..", "..", "photos");

// slug → ordered files (cover first, then gallery shots), relative to /photos
const GAL = {
  "pi-mabel": ["mabel/pi-mabel.jpeg", "mabel/part2.jpeg"],
  "delta-qp": ["medinstrus/delta_qp/deltaqp.jpeg", "medinstrus/delta_qp/part2.jpg", "medinstrus/delta_qp/part3.jpg", "medinstrus/delta_qp/part4.jpg"],
  "drone4": ["medinstrus/drone4/drone4.jpeg", "medinstrus/drone4/part2.jpg", "medinstrus/drone4/part3.jpg", "medinstrus/drone4/part4.jpg"],
  "elite": ["medinstrus/elite/elite.jpeg", "medinstrus/elite/part2.jpg", "medinstrus/elite/part3.jpg"],
  "zulu-3": ["medinstrus/zulu-3/zulu3.jpeg", "medinstrus/zulu-3/part2.png"],
  "rsl-4500": ["rodenstockgallerie/RSL 4500/rsl-4500-digital.jpeg", "rodenstockgallerie/RSL 4500/rsl4500part2.jpeg", "rodenstockgallerie/RSL 4500/part3.png", "rodenstockgallerie/RSL 4500/part4.jpg"],
  "topascope": ["rodenstockgallerie/Topascope/topascope.jpeg", "rodenstockgallerie/Topascope/part2.jpg", "rodenstockgallerie/Topascope/part3.jpg", "rodenstockgallerie/Topascope/part4.png"],
  "al-6600": ["rodenstockgallerie/al6600/al-6600.jpeg", "rodenstockgallerie/al6600/part2.jpg", "rodenstockgallerie/al6600/part3.jpg", "rodenstockgallerie/al6600/part4.png"],
  "alino": ["rodenstockgallerie/alino/alino.jpeg", "rodenstockgallerie/alino/part2.jpg", "rodenstockgallerie/alino/part3.png"],
  "cv-600": ["rodenstockgallerie/cv 600/cv-600.jpeg", "rodenstockgallerie/cv 600/part2.jpg", "rodenstockgallerie/cv 600/part3.jpg"],
  "fundusscope": ["rodenstockgallerie/fundusscope/fundusscope.jpeg", "rodenstockgallerie/fundusscope/part2.jpg", "rodenstockgallerie/fundusscope/part3.jpg"],
  "peristat-2": ["rodenstockgallerie/peristat2/peristat-2.jpeg", "rodenstockgallerie/peristat2/part2.jpg", "rodenstockgallerie/peristat2/part3.png", "rodenstockgallerie/peristat2/part4.png"],
  "phoromat-2000": ["rodenstockgallerie/phoromat 2000/phoromat-200.jpeg", "rodenstockgallerie/phoromat 2000/part2.png", "rodenstockgallerie/phoromat 2000/part3.jpg", "rodenstockgallerie/phoromat 2000/part4.png"],
  "pro500": ["rodenstockgallerie/pro500/pro500.jpeg", "rodenstockgallerie/pro500/part2.jpg", "rodenstockgallerie/pro500/part3.jpg", "rodenstockgallerie/pro500/part4.png"],
  "rem-4000": ["rodenstockgallerie/rem4000/rem-4000.jpeg", "rodenstockgallerie/rem4000/part2.jpg", "rodenstockgallerie/rem4000/part3.jpg", "rodenstockgallerie/rem4000/part4.png"],
  "rodachart-422": ["rodenstockgallerie/rodachart422/rodachart-422.jpeg", "rodenstockgallerie/rodachart422/rodachartpart2.jpg", "rodenstockgallerie/rodachart422/rodachartpart3.jpg"],
  "rsl-2600": ["rodenstockgallerie/rsl 2600/rsl2600.jpeg", "rodenstockgallerie/rsl 2600/part2.jpg", "rodenstockgallerie/rsl 2600/part3.jpg"],
  "activa": ["sbm sistemi/activa/activa.jpeg", "sbm sistemi/activa/2.jpg", "sbm sistemi/activa/3.jpg", "sbm sistemi/activa/4.jpg"],
  "dslc200": ["sbm sistemi/dslc200/dslc200.jpeg", "sbm sistemi/dslc200/1.jpg", "sbm sistemi/dslc200/2.jpg", "sbm sistemi/dslc200/3.jpg", "sbm sistemi/dslc200/4.jpg"],
  "idra": ["sbm sistemi/idra/1.jpg", "sbm sistemi/idra/2.jpg", "sbm sistemi/idra/3.jpg", "sbm sistemi/idra/4.jpg"],
  "os1000": ["sbm sistemi/os1000/os1000.jpeg", "sbm sistemi/os1000/1.jpg", "sbm sistemi/os1000/2.jpg"],
  "rb-800": ["vision star/rb-800.jpeg", "vision star/rb-800 part2.jpeg", "vision star/rb-800 part3.jpeg"],
};

async function optimize(absPath) {
  const ext = extname(absPath).toLowerCase();
  const img = sharp(absPath).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true });
  if (ext === ".png") return { buf: await img.png({ compressionLevel: 9 }).toBuffer(), ext: "png", ct: "image/png" };
  return { buf: await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer(), ext: "jpg", ct: "image/jpeg" };
}

let ok = 0;
for (const [slug, files] of Object.entries(GAL)) {
  const urls = [];
  let n = 0;
  for (const rel of files) {
    const abs = join(PHOTOS, rel);
    if (!existsSync(abs)) { console.log(`  MISSING ${rel}`); continue; }
    n++;
    const { buf, ext, ct } = await optimize(abs);
    const r = await uploadBuffer(buf, `${n}.${ext}`, `products/gallery/${slug}`, env, ct);
    urls.push(r.url);
  }
  const [cover, ...rest] = urls;
  const { error } = await sb.from("products").update({ image_url: cover, images: rest }).eq("slug", slug);
  if (!error) ok++;
  console.log(`${slug.padEnd(16)} cover + ${rest.length} gallery  ${error ? "DB-ERR " + error.message : "ok"}`);
}
console.log(`\n${ok}/${Object.keys(GAL).length} products updated with galleries.`);
