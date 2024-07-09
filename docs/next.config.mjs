import nextraConfig from "nextra";

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/toppings",
  images: {
    unoptimized: true,
  },
  output: "export",
  reactStrictMode: true,
};

const withNextra = nextraConfig({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.jsx",
});

export default withNextra(nextConfig);
