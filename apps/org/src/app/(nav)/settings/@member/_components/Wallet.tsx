"use client";

import React, { useState } from "react";

import axios from "axios";
import { Building2, FileBadge, User } from "lucide-react";

import type { PostVcResponse } from "@/app/api/iota/vc/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MemberCredentialType } from "@/lib/db/type";

type Props = {
  vc?: MemberCredentialType;
};

export function Wallet({ vc: dbVc }: Props) {
  const [vc, setVc] = useState<MemberCredentialType | undefined>(dbVc);
  const [did, setDid] = useState<string>("");

  const handleCreateVc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post<PostVcResponse>("/api/iota/vc", { did });
      if (res.data.error) {
        console.error("POST /api/iota/vc", res.data.error);
        return;
      }
      setVc(res.data.data.vc);
    } catch (error) {
      console.error("POST /api/iota/vc", error);
    }
  };

  if (!vc)
    return (
      <form
        className="flex w-full items-stretch justify-between gap-4"
        onSubmit={handleCreateVc}
      >
        <Input
          type="text"
          className="flex-1 font-mono placeholder:font-sans"
          placeholder="Enter your DID here to get started"
          value={did}
          onChange={(e) => setDid(e.target.value.trim())}
        />
        <Button className="" type="submit">
          Connect
        </Button>
      </form>
    );
  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-3">
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
                {vc.issuerdid}
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
                {vc.issuerdid}
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
          <section className="overflow-x-auto">
            <p className="mb-0.5 text-sm">JWT</p>
            <div className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
              {vc.jwt}
            </div>
          </section>
          <section className="overflow-x-auto">
            <p className="mb-0.5 text-sm">Credential</p>
            <pre className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
              {JSON.stringify(JSON.parse(vc.content).credential, null, 2)}
            </pre>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
