import { Suspense } from "react";

import Image from "next/image";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Back } from "./_components/Back";
import { Login } from "./_components/Login";
import { SignUp } from "./_components/SignUp";

export default async function Page() {
  return (
    <div className="flex h-dvh p-3">
      <div className="hidden max-w-[1024px] flex-1 overflow-hidden rounded-2xl lg:block">
        <Image
          className="h-full object-cover brightness-125 contrast-125 dark:brightness-[80%]"
          src="/background.png"
          alt="background"
          height={1024}
          width={1024}
          priority
        />
      </div>
      <Tabs
        defaultValue="login"
        className="mx-auto flex flex-1 flex-col items-center justify-between"
      >
        <div className="flex w-full items-center justify-between px-3 py-3 lg:pl-6">
          <TabsList>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
            {/* <TabsTrigger value="addkey">Add Key</TabsTrigger> */}
          </TabsList>
          <Suspense>
            <Back />
          </Suspense>
        </div>
        <div>
          <TabsContent value="signup">
            <Suspense>
              <SignUp />
            </Suspense>
          </TabsContent>
          <TabsContent value="login">
            <Suspense>
              <Login />
            </Suspense>
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
