import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigDb, DataDb } from "@/lib/db";

import { Auth } from "./_components/Auth";
import { Users } from "./_components/Users";

export default async function Page() {
  const dataDb = await DataDb.getInstance();
  const users = Object.values(dataDb.data.users).map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    permission: u.permission,
  }));
  const configDb = await ConfigDb.getInstance();

  return (
    <Tabs defaultValue="users" className="w-full space-y-4">
      <TabsList className="grid w-fit grid-cols-2">
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="auth">Authentication</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Users users={users} />
      </TabsContent>
      <TabsContent value="auth">
        <Auth config={configDb.data} />
      </TabsContent>
    </Tabs>
  );
}
