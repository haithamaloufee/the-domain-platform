import type { MetadataRoute } from "next";
import { getConfiguredWebsiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const configuredUrl = getConfiguredWebsiteUrl();
  if (process.env.NODE_ENV !== "production" || !configuredUrl) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/login", "/api"],
    },
    sitemap: new URL("/sitemap.xml", configuredUrl).toString(),
  };
}
