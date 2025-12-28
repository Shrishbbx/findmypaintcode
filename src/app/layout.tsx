import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DevTools } from "@/components/DevTools";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FindMyPaintCode - Find Your Car's Paint Code Easily",
  description: "Confused about finding your car's paint code? Our AI-powered assistant helps you identify your exact paint color and guides you to where to find the code on your vehicle.",
  keywords: ["paint code", "car paint", "automotive paint", "vehicle color code", "touch up paint"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <DevTools />
      </body>
    </html>
  );
}
