"use client";

import { usePathname } from "next/navigation";

import { Wallet } from "lucide-react";

import { utf8Tob64u } from "@/lib/utils/base64url";
import { cn } from "@/lib/utils/shadcn";

type Props = {
  wallets: { name: string }[];
};

export function WalletNav({ wallets }: Props) {
  const pathname = usePathname();
  const notWallets = !pathname.startsWith("/wallets/");

  return (
    <nav className="bg-foreground/10 dark:bg-background text-foreground sticky inset-y-0 left-0 z-10">
      <ul
        className={
          "scroll-container pointer-events-none -mr-[300px] flex h-full flex-col gap-4 overflow-y-scroll p-4 pr-[316px]"
        }
      >
        <li
          key="_home"
          className={cn(
            "hover:bg-primary/90 hover:text-primary-foreground/90 dark:bg-muted bg-background group pointer-events-auto relative rounded-[50%] transition-all ease-out hover:cursor-pointer hover:rounded-[30%]",
            notWallets
              ? "dark:bg-primary bg-primary text-primary-foreground rounded-[30%]"
              : "",
          )}
        >
          <a
            href="/"
            className="relative flex h-12 w-12 flex-none items-center justify-center"
          >
            <div
              className={cn(
                "bg-foreground absolute h-12 w-12 -translate-x-full scale-0 rounded-[6px] transition-transform group-hover:scale-x-50 group-hover:scale-y-[40%]",
                notWallets
                  ? "scale-x-50 scale-y-75 group-hover:scale-y-75"
                  : "",
              )}
            />
            <div
              className={cn(
                "text-foreground before:bg-background bg-background absolute left-20 z-50 flex h-10 scale-0 items-center whitespace-nowrap rounded-[4px] px-4 py-2 shadow-lg shadow-black/10 transition-transform before:absolute before:-left-1 before:-z-10 before:size-4 before:rotate-45 group-hover:scale-100",
                notWallets ? "" : "",
              )}
            >
              Home
            </div>
            <div>
              <Wallet size={24} />
            </div>
          </a>
        </li>
        <li className="dark:bg-muted bg-foreground/20 mx-auto h-[2px] w-3/4 flex-none rounded-sm" />
        {wallets.map((wallet) => {
          const b64uWalletName = utf8Tob64u(wallet.name);
          const isCurrentWallet = pathname.split("/")[2] === b64uWalletName;
          return (
            <li
              key={wallet.name}
              className={cn(
                "hover:bg-primary/90 hover:text-primary-foreground/90 dark:bg-muted bg-background group pointer-events-auto relative rounded-[50%] transition-all ease-out hover:cursor-pointer hover:rounded-[30%]",
                isCurrentWallet
                  ? "dark:bg-primary bg-primary text-primary-foreground rounded-[30%]"
                  : "",
              )}
            >
              <a
                href={`/wallets/${b64uWalletName}`}
                className="relative flex h-12 w-12 flex-none items-center justify-center"
              >
                <div
                  className={cn(
                    "bg-foreground absolute h-12 w-12 -translate-x-full scale-0 rounded-[6px] transition-transform group-hover:scale-x-50 group-hover:scale-y-[40%]",
                    isCurrentWallet
                      ? "scale-x-50 scale-y-75 group-hover:scale-y-75"
                      : "",
                  )}
                />
                <div
                  className={cn(
                    "text-foreground before:bg-background bg-background absolute left-20 z-50 flex h-10 scale-0 items-center whitespace-nowrap rounded-[4px] px-4 py-2 shadow-lg shadow-black/10 transition-transform before:absolute before:-left-1 before:-z-10 before:size-4 before:rotate-45 group-hover:scale-100",
                    isCurrentWallet ? "" : "",
                  )}
                >
                  {wallet.name}
                </div>
                <div>{abbreviation(wallet.name)}</div>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function abbreviation(name: string) {
  return (
    name
      .split(" ")
      .slice(0, 2)
      .map((char) => char[0]?.toUpperCase())
      .join("") + (name[1] || "")
  ).slice(0, 2);
}
