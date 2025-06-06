import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IC Node Monitoring",
  description: "Generated by IC Node Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet/dist/leaflet.css"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet.markerplayer/Leaflet.MarkerPlayer.css"
        />
        <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.markerplayer@latest"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
