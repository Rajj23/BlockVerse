import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Prevent Next.js from issuing 308 redirects for trailing slashes
  trailingSlash: false,
  async rewrites() {
    // BACKEND_URL is resolved server-side (inside Docker: http://backend:8080)
    // The browser never sees the backend URL — all requests go to the same origin.
    const backendUrl = process.env.BACKEND_URL || "http://blockverse-backend:8080";
    return [
      {
        // Proxy all /api/* calls → backend (strips /api prefix)
        source: "/api/:path*",
        destination: `${backendUrl}/:path*`,
      },
      {
        // Proxy /share/* → backend /share/* (no prefix change needed)
        source: "/share/:path*",
        destination: `${backendUrl}/share/:path*`,
      },
      {
        // Proxy /ws/* → backend WebSocket endpoint
        source: "/ws/:path*",
        destination: `${backendUrl}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
