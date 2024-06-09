import { token } from "@/lib/auth";

import { Page } from "./_components/Page";

export default async function NavLayout({
  params: { name },
}: Readonly<{
  children: React.ReactNode;
  params: { name: string; index: string };
}>) {
  const tk = await token(name);

  return <Page name={name} needLogin={!tk} />;
}
