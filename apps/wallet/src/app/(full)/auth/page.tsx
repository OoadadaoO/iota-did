import Image from "next/image";
import { redirect } from "next/navigation";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";

import { Back } from "./_components/Back";
import { Login } from "./_components/Login";
import { SignUp } from "./_components/SignUp";

export default async function Page() {
  const session = await auth();
  if (session && session.user) {
    redirect("/");
  }

  return (
    <div className="grid h-dvh grid-cols-1 p-3 lg:grid-cols-2">
      <div className="hidden overflow-hidden rounded-2xl lg:block">
        <Image
          className="h-full object-cover brightness-110 contrast-100 dark:brightness-[80%]"
          src="/background.png"
          alt="background"
          height={1024}
          width={1024}
          priority
        />
      </div>
      <Tabs
        defaultValue="login"
        className="flex flex-col items-center justify-between"
      >
        <div className="flex w-full items-center justify-between px-3 py-3 lg:pl-6">
          <TabsList>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
            {/* <TabsTrigger value="addkey">Add Key</TabsTrigger> */}
          </TabsList>
          <Back />
        </div>
        <div>
          <TabsContent value="signup">
            <SignUp />
          </TabsContent>
          <TabsContent value="login">
            <Login />
          </TabsContent>
          {/* <TabsContent value="addkey">Change your password here.</TabsContent> */}
        </div>
        <div className="text-muted-foreground pt-6 text-sm tracking-tight">
          Powered by NMLab, NTU
        </div>
      </Tabs>
    </div>
  );
}
