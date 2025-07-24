import type { Metadata, Viewport } from "next";
import "./globals.css";
import type { JSX, ReactNode } from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "next-themes";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Arnav Sharma: Beyond the screen",
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
  metadataBase: new URL("https://www.arnnvv.sbs"),
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const themeSanitizerScript = `
(function() {
    var theme = localStorage.getItem('theme');
    if (theme && theme !== 'light' && theme !== 'dark') {
      localStorage.removeItem('theme');
    }
})();
`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-sanitizer" strategy="beforeInteractive">
          {themeSanitizerScript}
        </Script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <div className="min-h-screen flex flex-col relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-30" />

            <Navbar />
            {children}
            <Footer />
          </div>
          <Toaster
            richColors={true}
            position="bottom-center"
            expand={true}
            duration={4000}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
