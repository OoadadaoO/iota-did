"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/shadcn";

export function Back({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  return (
    <Button
      variant="ghost"
      className={cn("", className)}
      onClick={() => router.push(searchParams.get("redirect") || "/")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 -scale-x-100"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </Button>
  );
}
