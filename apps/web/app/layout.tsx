import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Spline_Sans, Noto_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: "--font-space-grotesk"
});

const splineSans = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-spline-sans",
  weight: ["400", "500", "700"],
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SpeakDeck - AI-Powered Presentations with Narration",
  description: "Create engaging presentations with AI-generated content, visuals, and narration in under 60 seconds.",
  keywords: ["AI", "presentations", "narration", "slides", "automation"],
  authors: [{ name: "SpeakDeck Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${splineSans.variable} ${notoSans.variable} font-space-grotesk antialiased`}>
        {children}
      </body>
    </html>
  );
}
