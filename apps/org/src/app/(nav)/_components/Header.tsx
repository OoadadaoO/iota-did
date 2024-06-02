"use client";

import { usePathname } from "next/navigation";

import { Menu, CircleUser } from "lucide-react";
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
import { decodePermission } from "@/lib/utils/decodePermission";
import { cn } from "@/lib/utils/shadcn";

import { LoginItem } from "./LoginItem";
import { LogoutItem } from "./LogoutItem";

const navigations = [
  {
    id: "home",
    url: "/",
    onlyAdmin: false,
  },
  {
    id: "shared",
    url: "/shared/",
    onlyAdmin: false,
  },
  {
    id: "private",
    url: "/private/",
    onlyAdmin: false,
  },
  {
    id: "admin",
    url: "/admin/",
    onlyAdmin: true,
  },
];

export function Header({ session }: { session: Session }) {
  const isLogin = !!session?.user;
  const permission = decodePermission(session?.user?.permission || 0);
  const pathname = usePathname();
  const filterNavs = navigations.filter(
    (nav) => !nav.onlyAdmin || permission.admin,
  );

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
            {filterNavs.map((nav) => (
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
        <p className="from-primary to-primary-foreground to-110% inline bg-gradient-to-b from-60% bg-clip-text text-transparent dark:from-40% dark:to-100%">
          {publicEnv.NEXT_PUBLIC_NAME}
        </p>
        <p className="text-primary-foreground absolute -z-10 translate-x-px translate-y-px">
          {publicEnv.NEXT_PUBLIC_NAME}
        </p>
        <span className="sr-only">FIDO App</span>
      </a>
      <nav className="hidden flex-col gap-6 text-lg font-medium lg:flex lg:flex-row lg:items-center lg:gap-6 lg:text-sm">
        {filterNavs.map((nav) => (
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            {isLogin ? <LogoutItem /> : <LoginItem />}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
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
