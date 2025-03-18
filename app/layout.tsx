import type { Metadata } from "next";
import "./globals.css";
import type { JSX, ReactNode } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Arnav Sharna: Beyond the screen",
  description: "Welcome to my digital world",
  keywords: [
    "arnav",
    "arnavsharma",
    "arnav sharma",
    "arnavsharmaiitr",
    "arnav sharma iitr",
    "arnavsharmaiitroorkee",
    "arnav sharma iit roorkee",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://arnnvv.vercel.app"),
  authors: {
    name: "Arnav Sharma",
    url: "https://github.com/arnnvv",
  },
  icons: {
    icon: "./favicon.ico",
    apple: "./favicon.ico",
    shortcut: "./favicon.ico",
  },
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Navbar />
          {children}
          <Footer />
        </div>
        <Toaster richColors={true} />
      </body>
    </html>
  );
}
