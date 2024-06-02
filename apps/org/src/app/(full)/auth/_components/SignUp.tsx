"use client";

import { type FormEvent, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import axios from "axios";

import type { PostAuthResponse } from "@/app/api/auth/type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignUp() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const redirect = useSearchParams().get("redirect");

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
    setLoading(true);
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      setLoading(false);
      return;
    }
    const res = await axios.post<PostAuthResponse>("/api/auth/", {
      email,
      password,
      type: "signup",
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
        <h1 className="text-2xl font-semibold tracking-tight">Sign Up</h1>
        <p className="text-muted-foreground text-sm">
          Remember to remember your password!
        </p>
      </div>
      <form className="grid" onSubmit={handleRegister}>
        <Input
          className=""
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          required
        />
        {emailError && (
          <p className="text-destructive mt-1 text-sm">{emailError}</p>
        )}
        <Input
          className="mt-2"
          type="password"
          name="password"
          placeholder="Password (8+ characters, numbers)"
          value={password}
          onChange={(e) => setPassword(e.target.value.trim())}
          minLength={8}
          required
        />
        {passwordError && (
          <p className="text-destructive mt-1 text-sm">{passwordError}</p>
        )}
        <Input
          className="mt-2"
          type="password"
          name="confirm password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value.trim())}
          minLength={8}
          required
        />
        {confirmPasswordError && (
          <p className="text-destructive mt-1 text-sm">
            {confirmPasswordError}
          </p>
        )}
        <Button
          variant="default"
          size="sm"
          className="mt-2 w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "loading..." : "Continue"}
        </Button>
      </form>
      <p className="text-muted-foreground px-8 text-center text-sm">
        By clicking continue, you agree to our{" "}
        <Link
          href="#"
          className="hover:text-primary underline underline-offset-4"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="hover:text-primary underline underline-offset-4"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
