import type { Metadata } from "next";
import "./globals.css";
import type { JSX, ReactNode } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Beyond the screen",
  description: "Welcome to my digital world",
  keywords: [
    "arnav",
    "arnav sharma",
    "arnav sharma iit roorkee",
    "arnav sharma iitr",
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
        {children}
        <Toaster richColors={true} />
      </body>
    </html>
  );
}
