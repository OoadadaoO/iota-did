import { useRouter } from "next/navigation";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LogoutItem() {
  const router = useRouter();
  return (
    <button
      className="w-full"
      onClick={async (e) => {
        e.preventDefault();
        await fetch("/api/auth/logout", { method: "POST" });
        router.refresh();
      }}
    >
      <DropdownMenuItem className="hover:cursor-pointer">
        Logout
      </DropdownMenuItem>
    </button>
  );
}
