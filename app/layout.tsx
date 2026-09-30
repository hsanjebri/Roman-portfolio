import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import Cursor from "@/components/cursor/Cursor";
import MotionRoot from "@/components/motion/MotionRoot";
import { INTRO_STORAGE_KEY } from "@/lib/intro";

const serif = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Didot", "Georgia", "serif"],
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  title: "Rowan Hawthorne — Wildlife & Nature Photography",
  description:
    "Wildlife and nature photography by Rowan Hawthorne: rare birds and wild places across Africa, the Arctic and the Americas. Fine art prints, commissions and field workshops.",
  openGraph: {
    title: "Rowan Hawthorne — Wildlife & Nature Photography",
    description: "Patience, then the perfect frame. Rare birds and wild places, photographed in natural light.",
    type: "website",
    siteName: "Rowan Hawthorne",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rowan Hawthorne — Wildlife & Nature Photography",
    description: "Patience, then the perfect frame.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C0D0D",
};

/** Runs before paint: flags JS, reduced motion and a seen intro, so first paint is already correct. */
const BOOT = `(function(){var d=document.documentElement;d.classList.add('js');try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('reduced');if(sessionStorage.getItem('${INTRO_STORAGE_KEY}')==='1')d.classList.add('intro-seen')}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a className="skip mono" href="#main">
          Skip to content
        </a>
        {children}
        <Cursor />
        <MotionRoot />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
