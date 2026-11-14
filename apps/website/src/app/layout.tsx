import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { NavigationTransitionProvider } from "@/components/layout/navigation-transition-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteContent } from "@/content/site";
import { getPublicBranding } from "@/lib/public-api";
import { getWebsiteUrl } from "@/lib/seo";
import { fallbackBranding } from "@the-domain/utils";
import "./globals.css";

// CMS data and deployment configuration are read by the running website.
export const dynamic = "force-dynamic";

const siteFont = localFont({
  src: "./fonts/Manrope-Variable.ttf",
  weight: "200 800",
  variable: "--font-site",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const branding = await loadBranding();
  return {
    metadataBase: getWebsiteUrl(),
    title: { default: siteContent.defaultSeoTitle, template: `%s | ${siteContent.name}` },
    description: siteContent.defaultSeoDescription,
    applicationName: siteContent.name,
    icons: branding.favicon
      ? { icon: branding.favicon.url }
      : { icon: [{ url: "/brand/the-domain-icon.png", sizes: "91x101", type: "image/png" }] },
    category: "entertainment",
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: siteContent.name,
      title: siteContent.defaultSeoTitle,
      description: siteContent.defaultSeoDescription,
      images: branding.socialImage ? [{ url: branding.socialImage.url }] : undefined,
      url: "/",
    },
    twitter: {
      card: branding.socialImage ? "summary_large_image" : "summary",
      title: siteContent.defaultSeoTitle,
      description: siteContent.defaultSeoDescription,
      images: branding.socialImage ? [branding.socialImage.url] : undefined,
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={siteFont.variable} lang="en">
      <body data-public-site>
        <NavigationTransitionProvider>
          <a
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-3 focus:text-canvas"
            href="#main-content"
          >
            Skip to content
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader
              logo={
                <Suspense fallback={<HeaderLogo />}>
                  <DynamicHeaderLogo />
                </Suspense>
              }
            />
            <main className="flex-1" id="main-content">
              {children}
            </main>
            <Suspense fallback={<SiteFooter branding={fallbackBranding} />}>
              <OperationalFooter />
            </Suspense>
          </div>
        </NavigationTransitionProvider>
      </body>
    </html>
  );
}

function HeaderLogo({ src }: { src?: string }) {
  return <BrandLogo className="h-auto w-[clamp(10.5rem,17vw,15.5rem)]" priority src={src} />;
}
async function DynamicHeaderLogo() {
  const branding = await loadBranding();
  return <HeaderLogo src={branding.primaryLogo?.url} />;
}
async function OperationalFooter() {
  return <SiteFooter branding={await loadBranding()} />;
}
async function loadBranding() {
  try {
    return await getPublicBranding();
  } catch {
    return fallbackBranding;
  }
}
