"use client";

import { usePathname } from "next/navigation";

import { Menu, CircleUser, Fingerprint } from "lucide-react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { useTheme } from "@/hook/ThemeProvider";
import type { Session } from "@/lib/auth/type";
import { publicEnv } from "@/lib/env/public";
import { cn } from "@/lib/utils/shadcn";

import { LoginItem } from "./LoginItem";
import { LogoutItem } from "./LogoutItem";

const navigations = [
  {
    id: "home",
    url: "/",
  },
  {
    id: "shared",
    url: "/shared/",
  },
  {
    id: "private",
    url: "/private/",
  },
];

export function Header({ session }: { session: Session }) {
  const isLogin = !!session?.user;
  const username = session?.user?.email.split("@")[0];
  const pathname = usePathname();

  return (
    <header className="bg-background/75 sticky top-0 z-50 flex h-16 items-center gap-4 border-b px-4 backdrop-blur-sm lg:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <div className="flex-1 shrink-0 lg:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent side="left">
          <h1 className="text-2xl font-semibold">Fido App</h1>
          <div className="border-border my-4 h-[1px] w-full border-b" />
          <nav className="grid gap-6 text-lg font-medium">
            {navigations.map((nav) => (
              <a
                key={nav.id}
                href={nav.url}
                className={`${
                  pathname === nav.url
                    ? "text-foreground"
                    : "text-muted-foreground"
                } hover:text-foreground capitalize transition-colors`}
              >
                {nav.id}
              </a>
            ))}
            <ThemeButton />
          </nav>
        </SheetContent>
      </Sheet>
      <a
        href="/"
        className="text-primary/90 relative flex w-10 items-center justify-center gap-2 font-serif text-4xl font-bold lg:flex-1 lg:justify-start"
      >
        <p className="from-primary to-primary-foreground inline bg-gradient-to-b from-65% to-100% bg-clip-text text-transparent dark:from-40% dark:to-100%">
          {publicEnv.NEXT_PUBLIC_NAME}
        </p>
        <p className="text-primary-foreground absolute -z-10 translate-x-px translate-y-px">
          {publicEnv.NEXT_PUBLIC_NAME}
        </p>
        <span className="sr-only">FIDO App</span>
      </a>
      <nav className="hidden flex-col gap-6 text-lg font-medium lg:flex lg:flex-row lg:items-center lg:gap-6 lg:text-sm">
        {navigations.map((nav) => (
          <a
            key={nav.id}
            href={nav.url}
            className={`${
              pathname === nav.url ? "text-foreground" : "text-muted-foreground"
            } hover:text-foreground capitalize transition-colors`}
          >
            {nav.id}
          </a>
        ))}
      </nav>
      <div className="flex w-full flex-1 items-center justify-end gap-4 lg:gap-4">
        <ThemeButton className="hidden lg:block" />
        <UserButton isLogin={isLogin} username={username} pathname={pathname} />
      </div>
    </header>
  );
}

function ThemeButton({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      // className="rounded-full bg-gray-200 p-2 dark:bg-gray-800"
      className={cn(
        "rounded-full p-2 transition-all lg:hover:rotate-45",
        className,
      )}
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

function UserButton({
  className,
  isLogin,
  username,
  pathname,
}: {
  className?: string;
  isLogin: boolean;
  username?: string;
  pathname: string;
}) {
  return isLogin ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className={cn("rounded-full p-2", className)}
        >
          <CircleUser className="aspect-square" />
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Hello, {username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <a href="/settings/">Settings</a>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-muted-foreground">
          Support
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {isLogin ? <LogoutItem /> : <LoginItem />}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <a href={`/auth?redirect=${pathname}`}>
      <Button
        variant="default"
        size="icon"
        className={cn(
          "text-foreground hover:text-primary-foreground md:bg-primary md:text-primary-foreground group rounded-full bg-transparent p-2",
          className,
        )}
      >
        <Fingerprint className="aspect-square transition-transform group-hover:scale-110" />
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </a>
  );
}
