const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/journey/:path*", destination: "/projects", permanent: false },
      { source: "/launch-kit/:path*", destination: "/projects", permanent: false },
      { source: "/dashboard/:path*", destination: "/projects", permanent: false },
      { source: "/progress", destination: "/projects", permanent: false },
      { source: "/game", destination: "/projects", permanent: false },
      { source: "/map", destination: "/projects", permanent: false },
      { source: "/access", destination: "/account", permanent: false },
      { source: "/tools", destination: "/pro#inside", permanent: false },
      { source: "/quick-start", destination: "/free", permanent: false },
      { source: "/demo", destination: "/example", permanent: false },
      { source: "/site-map", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
