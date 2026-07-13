import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@the-domain/ui", "@the-domain/types", "@the-domain/utils"],
};
export default nextConfig;
