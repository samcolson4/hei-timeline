import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HEI Network Timeline",
    template: "%s · HEI Network Timeline",
  },
  description:
    "A clean timeline of HEI Network releases, ordered by air date. Links go to the official heinetwork.tv site.",
  openGraph: {
    title: "HEI Network Timeline",
    description:
      "A clean timeline of HEI Network releases, ordered by air date.",
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "HEI Network Timeline",
  },
  twitter: {
    card: "summary_large_image",
    title: "HEI Network Timeline",
    description:
      "A clean timeline of HEI Network releases, ordered by air date.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
