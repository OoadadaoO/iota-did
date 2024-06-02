"use client";

import { usePathname } from "next/navigation";

import { Edit2 } from "lucide-react";

import { b64uToUtf8 } from "@/lib/utils/base64url";
import { cn } from "@/lib/utils/shadcn";

type Props = {
  accounts: {
    name: string;
    index: number;
    addresses: { address: string }[];
  }[];
};

export function AccountNav({ accounts }: Props) {
  const pathname = usePathname();

  return (
    <div className="sticky inset-y-0 left-0 z-0 flex h-full w-[240px] flex-col">
      <div className="bg-muted/75 dark:bg-muted text-foreground sticky top-0 flex h-12 items-center px-4 font-semibold">
        {b64uToUtf8(pathname.split("/")[2])}
      </div>
      <div className="dark:bg-muted/60 bg-muted-foreground/25 h-px" />
      <div className="dark:bg-muted/85 bg-muted-foreground/15 h-px" />

      <nav className="scroll-container bg-muted/75 dark:bg-muted text-foreground flex-1 overflow-y-scroll">
        <ul className={"flex h-full select-none flex-col gap-[2px] p-2"}>
          {accounts.map((account) => {
            const isCurrentAccount =
              pathname.split("/")[4] === account.index.toString();
            return (
              <li
                key={account.index.toString()}
                className={cn(
                  "hover:bg-foreground/5 text-muted-foreground hover:text-foreground group flex-none rounded-sm transition-all ease-out hover:cursor-pointer",
                  isCurrentAccount
                    ? "bg-foreground/10 hover:bg-foreground/10 text-foreground"
                    : "",
                )}
              >
                <a
                  href={
                    isCurrentAccount
                      ? "#top"
                      : `/wallets/${pathname.split("/")[2]}/accounts/${account.index}`
                  }
                  className="relative flex w-full flex-col items-start justify-between px-4 py-2"
                >
                  <div className="relative flex w-full items-center justify-between">
                    <div>{account.name}</div>
                    <button>
                      <Edit2
                        size={16}
                        className={cn(
                          "text-muted-foreground hover:text-foreground hidden group-hover:block",
                          isCurrentAccount ? "block" : "",
                        )}
                      />
                    </button>
                  </div>
                  {isCurrentAccount &&
                    account.addresses.map((address) => (
                      <div
                        key={`${account.index}-${address.address}`}
                        className="text-muted-foreground h-fit w-full truncate text-sm"
                      >
                        {address.address}
                      </div>
                    ))}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
