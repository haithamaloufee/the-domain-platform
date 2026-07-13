import type { Metadata } from "next";
import { Geist, Inter, Syne } from "next/font/google";
import "./globals.css";
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
export const metadata: Metadata = {
  title: { default: "The Domain Admin", template: "%s | The Domain Admin" },
  description: "Content operations for The Domain Platform",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html className={`${syne.variable} ${inter.variable} ${geist.variable}`} lang="en">
      <body>
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-gold focus:px-4 focus:py-3 focus:text-canvas"
          href="#admin-content"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
