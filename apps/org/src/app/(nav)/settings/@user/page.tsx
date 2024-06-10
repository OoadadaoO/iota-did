import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { token } from "@/lib/auth";
import { DataDb } from "@/lib/db";

import { Vc } from "./_components/Vc";

export default async function Page() {
  const tk = await token();
  const dataDb = await DataDb.getInstance();
  const vc = Object.values(dataDb.data.partnerCredentials).find(
    (vc) => vc.userId === tk?.sub,
  );

  return (
    <Tabs defaultValue="vc" className="w-full space-y-4">
      <TabsList className="grid w-fit grid-cols-2">
        <TabsTrigger value="vc">Verifiable Credential</TabsTrigger>
        <TabsTrigger value="soon" disabled>
          Coming Soon
        </TabsTrigger>
      </TabsList>
      <TabsContent value="vc">
        <Vc vc={vc} />
      </TabsContent>
    </Tabs>
  );
}
