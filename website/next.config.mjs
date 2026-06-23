/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/enrych/toppings/**",
      },
    ],
  },
  output: "export",
  reactStrictMode: true,
};

export default nextConfig;
