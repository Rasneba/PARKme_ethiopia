import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parkme Ethiopia | Park smarter in Addis Ababa",
  description: "Find, reserve, and manage parking spaces across Addis Ababa. Park smarter, earn as a host.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Parkme",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Parkme Ethiopia",
    description: "Find, reserve, and manage parking spaces across Addis Ababa.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0fa24b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon.svg" sizes="any" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0fa24b" />
      </head>
      <body className="antialiased">
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function() {});
            });
          }
        `}} />
        {children}
      </body>
    </html>
  );
}
