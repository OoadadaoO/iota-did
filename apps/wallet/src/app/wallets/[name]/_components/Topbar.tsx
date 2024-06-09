"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hook/ThemeProvider";
import { cn } from "@/lib/utils/shadcn";
import type { Account } from "@did/wallet-server/types";

type Props = {
  selectedAcc: Account;
};

export function Topbar({ selectedAcc }: Props) {
  return (
    <div className="sticky inset-x-0 top-0 z-10 flex w-full flex-col">
      <div className="dark:bg-foreground/15 bg-background text-foreground sticky top-0 flex h-12 items-center justify-between px-4">
        <h1 className="">
          {selectedAcc.name}
          <span className="text-muted-foreground select-all font-mono text-sm before:content-['/']">
            {selectedAcc.address}
          </span>
        </h1>
        <ThemeButton className="bg-transparent transition-transform hover:rotate-45 hover:bg-transparent" />
      </div>
      <div className="dark:bg-muted/75 bg-foreground/10 h-px" />
      <div className="dark:bg-muted/100 bg-foreground/5 h-px" />
    </div>
  );
}

function ThemeButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      // className="rounded-full bg-gray-200 p-2 dark:bg-gray-800"
      className={cn("rounded-full p-2", className)}
      variant="secondary"
      onClick={() => {
        setTheme(theme === "light" ? "dark" : "light");
      }}
    >
      {/* {theme === "light" ? "☀️" : "🌙"} */}
      {theme === "light" ? (
        <Sun className="aspect-square" />
      ) : (
        <Moon className="aspect-square" />
      )}
    </Button>
  );
}
