import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Dashboard Runner | DBI Virtual Run 2026",
  description: "Dashboard peserta DBI Virtual Run 2026 - input aktivitas & leaderboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="bg-ink text-white font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
