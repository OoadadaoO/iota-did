import { getAccounts } from "@/lib/db/example";

import { AccountNav } from "./_components/AccountNav";
import { Topbar } from "./_components/Topbar";

export default async function NavLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { walletName: string };
}>) {
  params;
  const accounts = getAccounts(params.walletName);
  return (
    <div className={`flex size-full flex-1`}>
      <AccountNav accounts={accounts} />
      <div className={`flex size-full flex-1 flex-col`}>
        <Topbar accounts={accounts} />
        <div className={`flex flex-1`}>{children}</div>
      </div>
    </div>
  );
}
