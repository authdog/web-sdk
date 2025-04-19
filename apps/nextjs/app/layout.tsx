import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthdogProvider } from "@authdog/nextjs-app/dist";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Authdog - Demo next",
  description: "kindly hosted on Vercel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthdogProvider>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          {children}
        </body>
      </AuthdogProvider>
    </html>
  );
}
