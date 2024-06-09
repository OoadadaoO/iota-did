"use client";

import React, { useState } from "react";

import axios from "axios";
import { Edit2, Loader, Plus } from "lucide-react";

import type { PostAccountsResponse } from "@/app/api/type";
import { Button } from "@/components/ui/button";
import { b64uToUtf8 } from "@/lib/utils/base64url";
import { cn } from "@/lib/utils/shadcn";
import type { Account } from "@did/wallet-server/types";

type Props = {
  name: string;
  selectedAcc: Account;
  setSelectedAcc: React.Dispatch<React.SetStateAction<Account>>;
  accs: Account[];
  setAccs: React.Dispatch<React.SetStateAction<Account[]>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
};

export function AccountNav({
  name,
  selectedAcc,
  setSelectedAcc,
  accs,
  setAccs,
  setNeedLogin,
}: Props) {
  return (
    <div className="sticky inset-y-0 left-0 z-0 flex h-full w-[240px] flex-col">
      <div className="bg-muted/75 dark:bg-muted text-foreground sticky top-0 flex h-12 items-center justify-between px-4 font-semibold">
        {b64uToUtf8(name)}
        <AddAccountButton
          name={name}
          setAccounts={setAccs}
          setNeedLogin={setNeedLogin}
        />
      </div>
      <div className="dark:bg-muted/60 bg-muted-foreground/25 h-px" />
      <div className="dark:bg-muted/85 bg-muted-foreground/15 h-px" />

      <nav className="scroll-container bg-muted/75 dark:bg-muted text-foreground flex-1 overflow-y-scroll">
        <ul className={"flex h-full select-none flex-col gap-[2px] p-2"}>
          {accs
            .sort((a, b) => a.index - b.index)
            .map((account) => {
              const isCurrentAccount = selectedAcc.index === account.index;
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
                  <div
                    className="relative flex w-full flex-col items-start justify-between px-4 py-2"
                    onClick={() => setSelectedAcc(account)}
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
                    {isCurrentAccount && (
                      <div
                        key={`${account.index}-${account.address}`}
                        className="text-muted-foreground h-fit w-full truncate text-sm"
                      >
                        {account.address}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </nav>
    </div>
  );
}

function AddAccountButton({
  name,
  setAccounts,
  setNeedLogin,
}: {
  name: string;
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className="text-foreground hover:bg-foreground/10 -mr-2 size-8 rounded-sm bg-transparent transition-all"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          const res = await axios.post<PostAccountsResponse>(
            `/api/iota/wallets/${name}/accounts`,
          );
          if (res.data.error) {
            alert(res.data.error.message);

            if (res.data.error.code === 401) {
              setNeedLogin((prev) => prev + 1);
            }
            return;
          }
          const account = res.data.data.account;
          setAccounts((prev) => [...prev, account]);
        } catch (error) {
          console.error(error);
          alert("Failed to create a new Account.");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader size={20} className="animate-spin" />
      ) : (
        <Plus size={20} />
      )}
    </Button>
  );
}
