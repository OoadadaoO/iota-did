"use client";

import React, { useEffect, useState } from "react";

import axios from "axios";

import type { Account, GetAccountsResponse } from "@did/wallet-server/types";

import { AccountNav } from "./AccountNav";
import { Dashboard } from "./Dashboard";
import { LoginModal, openLoginModal } from "./LoginModal";
import { Topbar } from "./Topbar";

type Props = {
  name: string;
  needLogin: boolean;
};

const defaultSelectedAcc = {
  name: "",
  index: 0,
  balance: "0",
  address: "",
  accountBalance: {
    total: "0",
    available: "0",
  },
};

export function Page({ name, needLogin: iNeedLogin }: Props) {
  const [reload, setReload] = useState<boolean>(false);
  const [, setLoading] = useState<boolean>(true);
  const [needLogin, setNeedLogin] = useState<number>(iNeedLogin ? 1 : 0);
  const [accs, setAccs] = useState<Account[]>([]);
  const [selectedAcc, setSelectedAcc] = useState<Account>(defaultSelectedAcc);

  useEffect(() => {
    if (needLogin) {
      openLoginModal();
    }
  }, [needLogin]);

  useEffect(() => {
    const getAccounts = async () => {
      try {
        setLoading(true);
        const res = await axios.get<GetAccountsResponse>(
          `/api/iota/wallets/${name}/accounts`,
        );
        if (res.data.error) {
          throw new Error(res.data.error.message);
        }
        const accounts = res.data.data.accounts.sort(
          (a, b) => a.index - b.index,
        );
        setAccs(accounts);
        setSelectedAcc(accounts?.[0] || defaultSelectedAcc);
      } catch (error) {
        console.error(error);
        setNeedLogin((prev) => prev + 1);
      } finally {
        setLoading(false);
      }
    };
    getAccounts();
  }, [name, reload]);

  return (
    <div className={`flex size-full flex-1`}>
      <AccountNav
        name={name}
        selectedAcc={selectedAcc}
        setSelectedAcc={setSelectedAcc}
        accs={accs}
        setAccs={setAccs}
        setNeedLogin={setNeedLogin}
      />
      <div className={`flex size-full flex-1 flex-col`}>
        <Topbar selectedAcc={selectedAcc} />
        <div className="dark:bg-foreground/15 bg-background text-foreground h-[calc(100vh-50px)] w-[calc(100vw-320px)]">
          <Dashboard
            key={selectedAcc.index}
            name={name}
            selectedAcc={selectedAcc}
            setSelectedAcc={setSelectedAcc}
            setAccs={setAccs}
            setNeedLogin={setNeedLogin}
            reload={reload}
          />
        </div>
      </div>
      <LoginModal name={name} setReload={setReload} />
    </div>
  );
}
