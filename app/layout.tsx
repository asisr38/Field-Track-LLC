import "./globals.css";
import { Inter, Open_Sans } from "next/font/google";
import type React from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from "next";
import "./styles/map.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-primary",
  display: "swap",
  preload: true
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-secondary",
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  title: {
    default: "Field Track LLC",
    template: "%s | Field Track LLC"
  },
  description:
    "Technology-driven Strategies for Land Management Agronomic Research Consulting & Project Implementation",
  icons: {
    icon: [
      { url: "/favicon_io/favicon.ico" },
      {
        url: "/favicon_io/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        url: "/favicon_io/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      }
    ],
    apple: { url: "/favicon_io/apple-touch-icon.png" },
    other: [
      {
        rel: "manifest",
        url: "/favicon_io/site.webmanifest"
      },
      {
        rel: "android-chrome-192x192",
        url: "/favicon_io/android-chrome-192x192.png"
      },
      {
        rel: "android-chrome-512x512",
        url: "/favicon_io/android-chrome-512x512.png"
      }
    ]
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://field-track-llc.vercel.app/"
  ),
  openGraph: {
    title: "Field Track LLC",
    description:
      "Technology-driven Strategies for Land Management Agronomic Research Consulting & Project Implementation",
    url: "https://field-track-llc.vercel.app/",
    siteName: "Field Track LLC",
    images: [
      {
        url: "https://field-track-llc.vercel.app/images/plotsdrone.jpg",
        width: 1200,
        height: 630,
        alt: "Aerial view of agricultural field trials"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Field Track LLC",
    description:
      "Technology-driven Strategies for Land Management Agronomic Research Consulting & Project Implementation",
    images: ["https://field-track-llc.vercel.app/images/plotsdrone.jpg"]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/favicon_io/site.webmanifest" />
        <script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin="anonymous"
          defer
        ></script>
      </head>
      <body className={`${inter.variable} ${openSans.variable} font-secondary`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Header />
          <main>{children}</main>
          <Footer />
          {/* <Chatbot /> */}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
