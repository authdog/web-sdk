import "@authdog/react-elements/styles.css";

import type { Metadata } from "next";
import "./globals.css";
import { AuthdogProvider } from "@authdog/nextjs-app/client";
import { ClientNavbar } from "./components/ClientNavbar";
import { Suspense } from "react";

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
      <body>
        <AuthdogProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientNavbar />
          </Suspense>
          <main className="flex-1">{children}</main>
        </AuthdogProvider>
      </body>
    </html>
  );
}
