/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/toppings",
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
