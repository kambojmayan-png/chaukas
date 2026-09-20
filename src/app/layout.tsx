import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "CHAUKAS (चौकस) — India's Scam Fire-Drill",
  description: "Get scammed here. Never out there. A 3-minute behavioural fire drill for UPI and impersonation scams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F3EC] text-[#111111]">
        {children}
      </body>
    </html>
  );
}
