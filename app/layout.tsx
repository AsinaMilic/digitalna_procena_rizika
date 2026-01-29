import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Digitalni Registar - Procena Rizika",
  description: "Sistem za procenu i upravljanje rizicima",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black min-h-screen font-sans`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
