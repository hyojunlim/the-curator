/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth", "hwp.js", "pdfkit"],
  },
  async redirects() {
    return [
      // Canonical domain: redirect www → non-www (301) to eliminate duplicate content
      // and fix Google Search Console "redirect error" / "duplicate, user did not select canonical"
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.thecurator.site" }],
        destination: "https://thecurator.site/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // XSS protection
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer policy - don't leak URLs
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Permissions policy - restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paddle.com https://cdn.paddle.com https://*.clerk.accounts.dev https://*.clerk.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.paddle.com; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://*.paddle.com https://*.clerk.accounts.dev https://*.clerk.com https://generativelanguage.googleapis.com https://cdn.paddle.com; frame-src https://*.paddle.com https://*.clerk.accounts.dev https://*.clerk.com; worker-src 'self' blob:;",
          },
          // Strict Transport Security (HTTPS only in production)
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
      // Note: removed blanket no-store on /api/(.*). Next.js dynamic API routes
      // are not cached by default, and individual routes that specifically need
      // no-store already set it themselves. This allows read endpoints like
      // /api/contracts and /api/subscription to be cached when appropriate.
    ];
  },
};

module.exports = nextConfig;
