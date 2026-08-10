import type { Metadata } from "next";
import { Cormorant_Garamond, Lato, Inter, Playfair_Display, Karla } from "next/font/google";
import "./globals.css";

// Self-hosted at build time by next/font. No runtime request to Google, no cost.
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-cormorant" });
const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700"], variable: "--font-lato" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-playfair" });
const karla = Karla({ subsets: ["latin"], variable: "--font-karla" });

export const metadata: Metadata = {
  title: "Wedding sites, without the fiddling",
  description: "Fill in a form, pick a look, share a link.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fonts = [cormorant, lato, inter, playfair, karla].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
