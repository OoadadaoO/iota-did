"use client";

import { useState, type FormEvent } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import axios from "axios";

import type { PostAuthResponse } from "@/app/api/auth/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const redirect = useSearchParams().get("redirect");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setLoading(true);
    const res = await axios.post<PostAuthResponse>("/api/auth/", {
      email,
      password,
      type: "login",
    });
    if (res.data.error) {
      const { code, message } = res.data.error;
      if (code === 1002) setEmailError(message);
      if (code === 1011) setEmailError(message);
      if (code === 1012) setPasswordError(message);
      if (code === 1013) setEmailError(message);
      if (code === 1014) setEmailError(message);
      if (code === 1015) setPasswordError(message);
      if (code === 9999) setEmailError(message);
      setLoading(false);
      return;
    }
    setLoading(false);
    router.push(redirect || "/");
  };
  return (
    <div className="flex w-[330px] flex-col gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-muted-foreground text-sm">
          Strong password is hard to remember lol.
        </p>
      </div>
      <form className="grid" onSubmit={handleLogin}>
        <Input
          className=""
          type="text"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && (
          <p className="text-destructive mt-1 text-sm">{emailError}</p>
        )}
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
          <p className="text-destructive mt-1 text-sm">{passwordError}</p>
        )}
        <Button
          variant="default"
          size="sm"
          className="mt-2 w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : "Access"}
        </Button>
      </form>
    </div>
  );
}
