import type { NextConfig } from "next";

// Deployed as static files to Cloudflare Pages from `out/`.
const nextConfig: NextConfig = {
  output: "export",
};

export default nextConfig;
