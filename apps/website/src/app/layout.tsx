import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getWebsiteUrl } from "@/lib/seo";
import { getPublicBranding } from "@/lib/public-api";
import { fallbackBranding } from "@the-domain/utils";
import "./globals.css";

const siteFont = Manrope({
  subsets: ["latin"],
  variable: "--font-site",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await loadBranding();
  return {
    metadataBase: getWebsiteUrl(),
    title: { default: branding.defaultSeoTitle, template: `%s | ${branding.siteName}` },
    description: branding.defaultSeoDescription,
    applicationName: branding.siteName,
    icons: branding.favicon ? { icon: branding.favicon.url } : undefined,
    category: "entertainment",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: branding.siteName,
      title: branding.defaultSeoTitle,
      description: branding.defaultSeoDescription,
      images: branding.socialImage ? [{ url: branding.socialImage.url }] : undefined,
      url: "/",
    },
    twitter: {
      card: branding.socialImage ? "summary_large_image" : "summary",
      title: branding.defaultSeoTitle,
      description: branding.defaultSeoDescription,
      images: branding.socialImage ? [branding.socialImage.url] : undefined,
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const branding = await loadBranding();
  return (
    <html className={siteFont.variable} lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-3 focus:text-canvas"
          href="#main-content"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader branding={branding} />
          <main className="flex-1" id="main-content">
            {children}
          </main>
          <SiteFooter branding={branding} />
        </div>
      </body>
    </html>
  );
}
async function loadBranding() {
  try {
    return await getPublicBranding();
  } catch {
    return fallbackBranding;
  }
}
