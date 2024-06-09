"use client";

import React, { useState, type FormEvent } from "react";

import axios from "axios";
import { Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PostPasswordResponse } from "@did/wallet-server/types";

type Props = {
  name: string;
  setReload: React.Dispatch<React.SetStateAction<boolean>>;
};

export function LoginModal({ name, setReload }: Props) {
  return (
    <div id="login-modal" className="hidden">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-background/60 fixed inset-0"
          onClick={() => closeLoginModal()}
        />
        <div className="bg-background z-10 mx-auto w-full max-w-md rounded-3xl shadow-md xl:max-w-lg">
          <div className="flex justify-end px-4 py-2">
            <button
              className="hover:text-muted-foreground/80 text-muted-foreground"
              onClick={() => closeLoginModal()}
            >
              &times;
            </button>
          </div>
          <Login name={name} setReload={setReload} />
        </div>
      </div>
    </div>
  );
}

export function openLoginModal() {
  document.getElementById("login-modal")?.classList.remove("hidden");
}

export function closeLoginModal() {
  document.getElementById("login-modal")?.classList.add("hidden");
}

export function Login({ name, setReload }: Props) {
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setLoading(true);
    const res = await axios.post<PostPasswordResponse>(
      `/api/iota/wallets/${name}/password`,
      {
        password,
      },
    );
    if (res.data.error) {
      const { code, message } = res.data.error;
      console.error("POST /api/iota/wallets/[name]/password", code, message);
      if (code === 401) setPasswordError(message);
      if (code === 400) setPasswordError(message);
      setLoading(false);
      return;
    }
    setPassword("");
    setLoading(false);
    setReload((prev) => !prev);
    closeLoginModal();
  };

  return (
    <div className="flex w-full flex-col gap-8 p-10 pt-0">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-muted-foreground text-sm">
          Strong password is hard to remember lol.
        </p>
      </div>
      <form className="grid" onSubmit={handleLogin}>
        <Input
          className="mt-2"
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {passwordError && (
          <p className="mt-1 text-sm text-red-500">{passwordError}</p>
        )}
        <Button
          variant="default"
          size="sm"
          className="mt-4 w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader className="animate-spin" /> : "Set Password"}
        </Button>
      </form>
    </div>
  );
}
