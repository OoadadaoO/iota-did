import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigDb, DataDb } from "@/lib/db";

import { Users } from "./_components/Users";
import { Wallet } from "./_components/Wallet";

export default async function Page() {
  const dataDb = await DataDb.getInstance();
  const users = Object.values(dataDb.data.users).map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    permission: u.permission,
  }));
  const configDb = await ConfigDb.getInstance();
  const config = {
    issueDid: configDb.data.issueDid || "",
    issueFragment: configDb.data.issueFragment || "",
    revokeFragment: configDb.data.revokeFragment || "",
  };

  return (
    <Tabs defaultValue="users" className="w-full space-y-4">
      <TabsList className="grid w-fit grid-cols-2">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="wallet">Wallet</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Users users={users} />
      </TabsContent>
      <TabsContent value="wallet">
        <Wallet config={config} />
      </TabsContent>
    </Tabs>
  );
}
