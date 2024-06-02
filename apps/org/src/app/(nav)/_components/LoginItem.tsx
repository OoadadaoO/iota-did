"use client";

import { usePathname } from "next/navigation";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LoginItem() {
  const pathname = usePathname();

  return (
    <a href={`/auth?redirect=${pathname}`}>
      <DropdownMenuItem className="hover:cursor-pointer">
        Login
      </DropdownMenuItem>
    </a>
  );
}
