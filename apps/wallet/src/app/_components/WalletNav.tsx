"use client";

import { type FormEvent, useState } from "react";

import Image from "next/image";
import { usePathname } from "next/navigation";

import axios from "axios";
import { Loader, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { utf8Tob64u } from "@/lib/utils/base64url";
import { cn } from "@/lib/utils/shadcn";
import type { PostWalletsResponse } from "@did/wallet-server/types";

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
            <div
              className={cn(
                "brightness-0 hover:brightness-100 dark:brightness-100",
                notWallets ? "brightness-100" : "",
              )}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={120}
                className="size-10 rounded-[50%] object-cover"
                priority
              />
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
        <li
          key="_new"
          className="hover:bg-foreground hover:text-background dark:bg-muted bg-background group pointer-events-auto relative rounded-[50%] transition-all ease-out hover:cursor-pointer hover:rounded-[30%]"
        >
          <CreateWalletButton />
        </li>
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

function CreateWalletButton() {
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [mnemonic, setMnemonic] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [mnemonicResult, setMnemonicResult] = useState<string>("");
  const [redirect, setRedirect] = useState<string>("");

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setNameError("");
    setPasswordError("");

    if (!name) {
      setNameError("Name is required");
      return;
    }
    if (!password) {
      setPasswordError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    if (mnemonic && mnemonic.split(" ").length !== 24) {
      setError("Mnemonic must be 24 words");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post<PostWalletsResponse>(`/api/iota/wallets`, {
        name: utf8Tob64u(name),
        password,
        mnemonic,
      });
      if (res.data.error) {
        const { code, message } = res.data.error;
        console.error("POST /api/iota/wallets", code, message);
        if (code === 403) setNameError(message);
        else if (code === 401) setPasswordError(message);
        else setError(message);
        setLoading(false);
        return;
      }
      const wallet = res.data.data.wallet;
      setPassword("");
      setLoading(false);
      setMnemonicResult(wallet.mnemonic);
      setRedirect(`/wallets/${utf8Tob64u(wallet.name)}`);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative flex h-12 w-12 flex-none items-center justify-center">
          {/* <div className="bg-foreground absolute h-12 w-12 -translate-x-full scale-0 rounded-[6px] transition-transform group-hover:scale-x-50 group-hover:scale-y-[40%]" /> */}
          <div className="text-foreground before:bg-background bg-background absolute left-20 z-50 flex h-10 scale-0 items-center whitespace-nowrap rounded-[4px] px-4 py-2 shadow-lg shadow-black/10 transition-transform before:absolute before:-left-1 before:-z-10 before:size-4 before:rotate-45 group-hover:scale-100">
            New Wallet
          </div>
          <div>
            <Plus size={20} />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-background max-w-md rounded-3xl border-0 shadow-md sm:rounded-3xl xl:max-w-lg">
        {mnemonicResult ? (
          <>
            <DialogHeader>
              <DialogTitle>Wallet Created</DialogTitle>
              <DialogDescription>
                Below is your mnemonic. Keep it safe and secure. It won't be
                shown again.
              </DialogDescription>
            </DialogHeader>
            <div className="grid py-2">
              <Textarea id="mnemonic" value={mnemonicResult} readOnly />
            </div>
            <DialogFooter>
              <a
                href={redirect}
                className="text-primary-foreground bg-primary rounded-md px-4 py-2 text-sm"
              >
                Go to Wallet
              </a>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>
                Create a new wallet to store your funds and manage your DIDs.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="name"
                  className="text-right after:text-red-500 after:content-['*']"
                >
                  Name
                </Label>
                <div className="col-span-3">
                  <Input
                    id="name"
                    value={name}
                    placeholder="Use only 0-9, a-z, A-Z, - and _"
                    onChange={(e) =>
                      setName(e.target.value.replace(/[^0-9a-zA-Z_-]/g, ""))
                    }
                    required
                  />
                  <p className="text-sm text-red-500">{nameError}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="password"
                  className="text-right after:text-red-500 after:content-['*']"
                >
                  Password
                </Label>
                <div className="col-span-3">
                  <Input
                    id="password"
                    value={password}
                    type="password"
                    placeholder="Use only 0-9, a-z, A-Z, - and _"
                    minLength={8}
                    onChange={(e) =>
                      setPassword(e.target.value.replace(/[^0-9a-zA-Z_-]/g, ""))
                    }
                    required
                  />
                  <p className="text-sm text-red-500">{passwordError}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="cpassword"
                  className="text-right after:text-red-500 after:content-['*']"
                >
                  Password
                </Label>
                <div className="col-span-3">
                  <Input
                    id="cpassword"
                    value={confirmPassword}
                    type="password"
                    placeholder="Use only 0-9, a-z, A-Z, - and _"
                    minLength={8}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value.replace(/[^0-9a-zA-Z_-]/g, ""),
                      )
                    }
                    required
                  />
                  <p className="text-sm text-red-500">{confirmPasswordError}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="mnemonic"
                  className="text-right after:text-transparent after:content-['*']"
                >
                  Mnemonic
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="mnemonic"
                    value={mnemonic}
                    placeholder="Optional, 24 words seperated by space"
                    onChange={(e) =>
                      setMnemonic(e.target.value.replace(/[^a-zA-Z ]/g, ""))
                    }
                  />
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {loading ? <Loader className="animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
