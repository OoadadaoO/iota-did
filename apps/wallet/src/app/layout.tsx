import type { Metadata } from "next";
import { Inter } from "next/font/google";

import axios from "axios";

import type { GetWalletsResponse } from "@/app/api/type";
import { ThemeProvider } from "@/hook/ThemeProvider";
import { privateEnv } from "@/lib/env/private";
import { cn } from "@/lib/utils/shadcn";

import { WalletNav } from "./_components/WalletNav";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "DID Wallet",
  description: "Decentralized Identity Wallet for the future",
  icons: [
    {
      url: `/favicon.ico`,
      sizes: "64x64",
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const res = await axios.get<GetWalletsResponse>(
    `${privateEnv.IOTA_EXPRESS_URL}/api/iota/wallets`,
  );
  return (
    <html lang="en" className="" suppressHydrationWarning>
      <body
        className={cn(
          "bg-muted h-dvh max-h-dvh min-w-[800px] font-sans antialiased",
          inter.variable,
        )}
      >
        <ThemeProvider>
          <div className="bg-background flex size-full">
            <WalletNav wallets={res.data.data?.wallets || []} />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
