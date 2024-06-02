import { getWallets } from "@/lib/db/example";

import { WalletNav } from "./_components/WalletNav";

export default async function NavLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Fetch wallets
  const wallets = getWallets();
  // TODO End
  return (
    <div className="bg-background flex size-full">
      <WalletNav wallets={wallets} />
      {children}
    </div>
  );
}
