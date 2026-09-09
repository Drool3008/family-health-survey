import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Telugu, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

// Full-coverage webfonts so hi/mr (Devanagari), te (Telugu) and as (Bengali-Assamese)
// render correctly. Browser picks the first family that has the glyph for each script.
const latin = Noto_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-latin", display: "swap" });
const deva = Noto_Sans_Devanagari({ subsets: ["devanagari"], weight: ["400", "600", "700"], variable: "--font-deva", display: "swap" });
const telugu = Noto_Sans_Telugu({ subsets: ["telugu"], weight: ["400", "600", "700"], variable: "--font-telugu", display: "swap" });
const bengali = Noto_Sans_Bengali({ subsets: ["bengali"], weight: ["400", "600", "700"], variable: "--font-bengali", display: "swap" });

export const metadata: Metadata = {
  title: "Family Health Survey",
  description: "Managing the family's health — The Ken Case Competition 2026",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${latin.variable} ${deva.variable} ${telugu.variable} ${bengali.variable}`}>
      <body>{children}</body>
    </html>
  );
}
