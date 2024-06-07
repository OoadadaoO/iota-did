import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SessionProvider } from "@/hook/SessionContext";
import { ThemeProvider } from "@/hook/ThemeProvider";
import { publicEnv } from "@/lib/env/public";
import { cn } from "@/lib/utils/shadcn";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: `${publicEnv.NEXT_PUBLIC_NAME}.Org`,
  description: "Organization of the future",
  icons: [
    {
      url: `/${publicEnv.NEXT_PUBLIC_NAME}/favicon.ico`,
      sizes: "64x64",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background min-h-screen font-sans antialiased",
          inter.variable,
        )}
      >
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
