import "./globals.css";

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { type JSX, type ReactNode, useId } from "react";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ThemeErrorBoundary } from "@/components/ThemeErrorBoundry";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { THEME_STORAGE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ViewTransitionsProvider } from "@/lib/view-transition";

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
  openGraph: {
    title: "Arnav Sharma: Beyond the screen",
    description: "Welcome to my digital world",
    url: "https://www.arnnvv.sbs",
    siteName: "arnnvv",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Arnav Sharma: Beyond the screen",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arnav Sharma: Beyond the screen",
    description: "Welcome to my digital world",
    images: ["/og.png"],
    creator: "@arnnnvvv",
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

const ThemeLoaderScript = `
  (function() {
    try {
      const themeKey = '${THEME_STORAGE_KEY}';
      const storedTheme = localStorage.getItem(themeKey);

      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (storedTheme !== 'light') {
        localStorage.removeItem(themeKey);
      }
    } catch (e) {
      console.error('Failed to load theme from localStorage', e);
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  const id = useId();
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://www.arnnvv.sbs/",
    name: "Arnav Sharma",
    alternateName: "arnnvv",
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Arnav Sharma",
    url: "https://www.arnnvv.sbs/",
    sameAs: [
      "https://x.com/arnnnvvv",
      "https://github.com/arnnvv",
      "https://www.linkedin.com/in/arnav-sharma-142716261",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: ThemeLoaderScript,
          }}
        />
        <Script
          id={`script-one-${id}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(websiteSchema)}
        </Script>
        <Script
          id={`script-two-${id}`}
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(personSchema)}
        </Script>
      </head>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ViewTransitionsProvider>
          <ThemeErrorBoundary>
            <ThemeProvider>
              <div className="relative flex min-h-screen flex-col">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] opacity-30" />
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
          </ThemeErrorBoundary>
        </ViewTransitionsProvider>
      </body>
    </html>
  );
}
