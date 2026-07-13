import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prakme — Park Smarter Across Addis Ababa",
  description: "Find and reserve verified parking spaces in Addis Ababa, or earn by hosting your empty spot. Made in Ethiopia.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
