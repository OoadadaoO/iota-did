"use client";

import React, { useState } from "react";

import axios from "axios";
import { Building2, FileBadge, User } from "lucide-react";

import type {
  PostValidateVpResponse,
  PostValidateVpResponseOk,
} from "@/app/api/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  vc?: PostValidateVpResponseOk["data"]["vc"];
};

export function Vc({ vc: dbVc }: Props) {
  const [vc, setVc] = useState<
    PostValidateVpResponseOk["data"]["vc"] | undefined
  >(dbVc);
  const [jwt, setJwt] = useState<string>("");

  const handleSubmitVp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post<PostValidateVpResponse>("/api/iota/vp", {
        jwt,
      });
      if (res.data.error) {
        console.error("POST /api/iota/vp", res.data.error);
        alert(res.data.error.message);
        return;
      }
      setVc(res.data.data.vc);
    } catch (error) {
      console.error("POST /api/iota/vp", error);
    }
  };

  if (!vc)
    return (
      <form
        className="flex w-full flex-col items-stretch justify-between gap-4"
        onSubmit={handleSubmitVp}
      >
        <Textarea
          className="h-60 font-mono placeholder:font-sans"
          placeholder="Enter your VP in JWT format here to get started"
          value={jwt}
          onChange={(e) => setJwt(e.target.value.trim())}
        />
        <Button className="ml-auto" type="submit">
          Present
        </Button>
      </form>
    );
  return (
    <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="flex flex-col items-stretch justify-start gap-4">
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <CardTitle className="text-xl font-semibold tracking-tight">
              You
            </CardTitle>
            <User className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="flex flex-col items-stretch gap-4 p-6 pt-0">
            <section>
              <p className="mb-0.5 text-sm">DID</p>
              <div className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
                {vc.did}
              </div>
            </section>
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between p-6">
            <CardTitle className="text-xl font-semibold tracking-tight">
              Issuer Info
            </CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent className="flex flex-col items-stretch gap-4 p-6 pt-0">
            <section>
              <p className="mb-0.5 text-sm">DID</p>
              <div className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
                {vc.issuerDid}
              </div>
            </section>
            <section>
              <p className="mb-0.5 text-sm">Verification Method</p>
              <div className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
                #{vc.issuerFragment}
              </div>
            </section>
            <section>
              <p className="mb-0.5 text-sm">Revocation Service</p>
              <div className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
                #{vc.revokeFragment}@{vc.revokeIndex}
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between p-6">
          <CardTitle className="text-xl font-semibold tracking-tight">
            Verifiable Credential
          </CardTitle>
          <FileBadge className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent className="flex flex-col items-stretch gap-4 p-6 pt-0">
          <section className="overflow-y-auto">
            <p className="mb-0.5 text-sm">JWT</p>
            <div className="text-muted-foreground select-all break-all font-mono leading-tight tracking-tight">
              {vc.jwt}
            </div>
          </section>
          <section className="overflow-x-auto">
            <p className="mb-0.5 text-sm">Credential</p>
            <pre className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
              {JSON.stringify(JSON.parse(vc.content), null, 2)}
            </pre>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
