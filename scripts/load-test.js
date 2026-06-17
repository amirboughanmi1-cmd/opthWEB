/**
 * k6 load test — public pages of OphtaHealth.
 *
 *   k6 run scripts/load-test.js                          (defaults to :3000)
 *   k6 run -e BASE_URL=https://your-site.netlify.app scripts/load-test.js
 *
 * IMPORTANT: run this against a PRODUCTION server (`next build && next start`)
 * or the deployed site — NOT `next dev`. The dev server is unminified, compiles
 * routes on first hit, and is not representative of real performance.
 *
 * Every failing request is logged with its URL + status, so a bad path in the
 * list below can't silently masquerade as a server "error rate".
 *
 * Profile: ramp 0→15→50→100 virtual users with human think-time.
 * Thresholds fail the run if >1% errors or p95 latency >800 ms.
 */
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "20s", target: 15 },  // montée douce — trafic normal
    { duration: "30s", target: 50 },  // pic réaliste
    { duration: "30s", target: 100 }, // stress — 100 visiteurs simultanés
    { duration: "20s", target: 0 },   // redescente
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3000";

// Every path MUST resolve to a real 200 page. A 404 here counts as a failure
// and inflates http_req_failed — slugs are verified against the live catalog.
const PAGES = [
  "/",
  "/catalogue",
  "/produits/pro500",
  "/produits/idra",
  "/produits/sl-1s",
  "/blog",
  "/blog/amelioration-images-oct-apprentissage-profond",
  "/a-propos",
  "/optique",
  "/recherche?q=oct",
];

export default function () {
  const path = PAGES[Math.floor(Math.random() * PAGES.length)];
  const res = http.get(`${BASE}${path}`, { tags: { path } });
  const ok = check(res, {
    "status 200": (r) => r.status === 200,
    "page non vide": (r) => !!r.body && r.body.length > 1000,
  });
  // Surface exactly which URL failed and why — this is what reveals a bad path
  // or a real 5xx during the run.
  if (!ok) console.error(`FAIL  ${res.status}  ${path}  (${res.timings.duration.toFixed(0)}ms)`);
  sleep(Math.random() * 2 + 1); // un humain lit 1–3 s entre deux pages
}
