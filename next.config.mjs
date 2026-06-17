import withBundleAnalyzer from "@next/bundle-analyzer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // All images are delivered via ImageKit with on-the-fly f-auto + responsive
    // widths. See src/lib/imagekitLoader.ts (admin data: previews pass through).
    loader: "custom",
    loaderFile: "./src/lib/imagekitLoader.ts",
  },
  async headers() {
    // Content-Security-Policy — restricts where scripts/styles/images/connections
    // may come from, so an injected <script> or stray external resource can't load.
    // Next's App Router injects inline hydration scripts/styles, so 'unsafe-inline'
    // is required; 'unsafe-eval' is dev-only (React Fast Refresh). Everything else
    // is locked to our own origin plus the two services we actually use
    // (Supabase data/auth, ImageKit images/uploads) and the Google Maps embed.
    const isDev = process.env.NODE_ENV !== "production";
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "img-src 'self' data: blob: https://ik.imagekit.io",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ik.imagekit.io https://upload.imagekit.io",
      // Google Maps embed (contact) + ImageKit PDF viewer (blog article documents).
      "frame-src 'self' https://maps.google.com https://www.google.com https://ik.imagekit.io",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        // Keep the admin area out of search engines. X-Robots-Tag is the most
        // reliable channel because these pages render client-side (a crawler
        // gets near-empty HTML, but always sees the HTTP header).
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      },
      {
        source: "/(.*)",
        headers: [
          // Lock down resource origins (XSS / injection defense-in-depth).
          { key: "Content-Security-Policy", value: csp },
          // Force HTTPS for 2 years once seen (browsers ignore it on plain http/localhost).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Never MIME-sniff responses into executables.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // The site must not be embeddable in an iframe (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // Send only the origin to third parties, full URL same-origin.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The site uses none of these device APIs.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// Wrap with the bundle analyzer — a no-op unless ANALYZE=true (npm run build).
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
