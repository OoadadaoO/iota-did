import { redirect } from "next/navigation";

import { token } from "@/lib/auth";
import { decodePermission } from "@/lib/utils/parsePermission";

export default async function Layout({
  user,
  member,
  admin,
}: {
  user: React.ReactNode;
  member: React.ReactNode;
  admin: React.ReactNode;
}) {
  const tk = await token();
  if (!tk) redirect("/auth/?redirect=/settings/");

  const permission = decodePermission(tk.scope);
  return (
    <div className="flex-1 space-y-6 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {permission.admin
            ? "Settings"
            : permission.member
              ? "Dashboard"
              : "Dashboard"}
        </h2>
      </div>
      {permission.admin ? admin : permission.member ? member : user}
    </div>
  );
}
