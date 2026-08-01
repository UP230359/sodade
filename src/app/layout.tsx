// app/layout.tsx (layout principal sin sidebar)
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import  Providers  from "../store/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sodade",
  description: "Emotional wellness app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FFFFFF]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}