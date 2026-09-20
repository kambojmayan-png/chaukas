import type { Metadata, Viewport } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chaukas.vercel.app'),
  title: "CHAUKAS (चौकस) — India's Scam Fire-Drill",
  description: "Get scammed here. Never out there. A 3-minute behavioural fire drill for UPI and impersonation scams.",
  openGraph: {
    title: "CHAUKAS (चौकस) — India's Scam Fire-Drill",
    description: "Get scammed here. Never out there. A 3-minute behavioural fire drill for UPI and impersonation scams.",
    url: 'https://chaukas.vercel.app',
    siteName: 'CHAUKAS',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "CHAUKAS (चौकस) — India's Scam Fire-Drill",
    description: "Get scammed here. Never out there. A 3-minute behavioural fire drill for UPI and impersonation scams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hi"
      className={`${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F3EC] text-[#111111]">
        {children}
      </body>
    </html>
  );
}
