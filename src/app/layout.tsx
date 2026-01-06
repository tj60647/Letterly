/**
 * @file src/app/layout.tsx
 * @description The root layout component that wraps all pages. Handles global fonts, metadata, and global styles.
 * @author Thomas J McLeish
 * @copyright (c) 2026 Thomas J McLeish
 * @license MIT
 *
 * @see Key Concepts: Root Layout, Global CSS, Next.js Fonts, Metadata
 */

import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const merriweather = Merriweather({
  variable: "--font-merriweather",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Letterly - AI Writing Assistant",
  description: "Turn messy thoughts into polished letters.",
};

/**
 * The Root Layout component.
 * Wraps all pages in the application.
 * Handles global font loading, metadata injection, and base HTML structure.
 * 
 * @param {Readonly<{ children: React.ReactNode }>} props - The component props containing the page content.
 * @returns {JSX.Element} The HTML structure with fonts and children.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
