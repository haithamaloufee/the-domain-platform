import type { Metadata } from "next";
import { Geist, Inter, Syne } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000"),
  title: { default: "The Domain Entertainment", template: "%s | The Domain" },
  description: "Premium entertainment experiences and events in Jordan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${syne.variable} ${inter.variable} ${geist.variable}`} lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-3 focus:text-canvas"
          href="#main-content"
        >
          Skip to content
        </a>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1" id="main-content">
            {children}
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
