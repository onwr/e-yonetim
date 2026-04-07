import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster as SonnerToaster } from "sonner";
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
  title: "e-Yönetim",
  description: "e-Yönetim SaaS Platformu",
  icons: {
    icon: "/analogo.svg",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth scroll-pt-24`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}