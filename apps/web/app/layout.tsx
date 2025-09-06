import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "SpeakDeck - AI-Powered Presentations with Narration",
  description: "Create engaging presentations with AI-generated content, visuals, and narration in under 60 seconds.",
  keywords: ["AI", "presentations", "narration", "slides", "automation"],
  authors: [{ name: "SpeakDeck Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
