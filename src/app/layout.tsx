import type { Metadata } from "next";
import { Archivo } from "next/font/google";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Five Bags and Two Sodas",
    template: "%s · Five Bags and Two Sodas",
  },
  description:
    "A complete On Cinema timeline — every episode and related release, ordered by air date.",
  openGraph: {
    title: "Five Bags and Two Sodas",
    description:
      "A complete On Cinema timeline — every episode and related release, ordered by air date.",
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Five Bags and Two Sodas",
  },
  twitter: {
    card: "summary_large_image",
    title: "Five Bags and Two Sodas",
    description:
      "A complete On Cinema timeline — every episode and related release, ordered by air date.",
  },
  icons: {
    icon: [{ url: "/popcorn.png", type: "image/png" }],
    apple: "/popcorn.png",
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
      className={`${archivo.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
