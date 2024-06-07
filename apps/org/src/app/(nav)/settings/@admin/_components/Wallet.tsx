"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { FilePen, FileX2, ScanFace, Settings } from "lucide-react";

import type { PutConfigResponse } from "@/app/api/config/type";
import type {
  GetDIDsResponse,
  GetDIDsResponseOk,
} from "@/app/api/iota/dids/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConfigSchema } from "@/lib/db";
import { DialogClose } from "@radix-ui/react-dialog";

type Props = {
  config: Required<ConfigSchema>;
};

export function Wallet({ config: dbConfig }: Props) {
  const [config, setConfig] = useState<Required<ConfigSchema>>(dbConfig);
  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <EditDialog config={config} setConfig={setConfig} />
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">DID</CardTitle>
          <ScanFace className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="truncate font-mono text-2xl font-semibold tracking-tight">
            {config?.issueDid || "No DID"}
          </div>
          <p className="text-muted-foreground text-sm">
            The DID used for issue verifiable credentials (VCs).
          </p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">#Assertion</CardTitle>
          <FilePen className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="truncate font-mono text-2xl font-semibold tracking-tight">
            {config?.issueFragment || "No Method"}
          </div>
          <p className="text-muted-foreground text-sm">
            The method used for issuing VCs.
          </p>
        </CardContent>
      </Card>
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">#Revocation</CardTitle>
          <FileX2 className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="font-mono text-2xl font-semibold tracking-tight">
            {config?.revokeFragment || "No Service"}
          </div>
          <p className="text-muted-foreground text-sm">
            The service used for revoking VCs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function EditDialog({
  config,
  setConfig,
}: {
  config: Required<ConfigSchema>;
  setConfig: (config: Required<ConfigSchema>) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [dids, setDids] = useState<GetDIDsResponseOk["data"]["dids"] | null>(
    null,
  );
  const [sDid, setSDid] = useState<string>(config.issueDid || "");
  const [sMethod, setSMethod] = useState<string>(config.issueFragment || "");
  const [sService, setSService] = useState<string>(config.revokeFragment || "");

  useEffect(() => {
    const fetchDids = async () => {
      try {
        const res = await axios.get<GetDIDsResponse>("/api/iota/dids");
        if (res.data.error) {
          console.error(res.data.error.message);
          return;
        }
        setDids(res.data.data.dids);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDids();
  }, []);

  const handleSave = async () => {
    if (!sDid || !sMethod || !sService) {
      return;
    }
    if (
      sDid === config.issueDid &&
      sMethod === config.issueFragment &&
      sService === config.revokeFragment
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put<PutConfigResponse>("/api/config", {
        issueDid: sDid,
        issueFragment: sMethod,
        revokeFragment: sService,
      });

      if (res.data.error) {
        console.error(res.data.error.message);
        setLoading(false);
        return;
      }
      setConfig({
        issueDid: sDid,
        issueFragment: sMethod,
        revokeFragment: sService,
      });
      setLoading(false);
      router.refresh();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className="group absolute -top-4 right-0 -translate-y-full p-4"
        >
          <Settings className="stroke-1 transition-transform group-hover:rotate-180" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Configuration</DialogTitle>
          <DialogDescription>
            Make changes to the configuration for issuing VCs to your members.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <>Loading...</>
        ) : dids === null || dids.length === 0 ? (
          <>No DID found</>
        ) : (
          <>
            <form className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  DID
                </Label>
                <Select
                  value={sDid}
                  defaultValue={config.issueDid || undefined}
                  onValueChange={(e) => setSDid(e)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="iota:did" />
                  </SelectTrigger>
                  <SelectContent>
                    {dids.map((did) => (
                      <SelectItem key={did.did} value={did.did}>
                        {did.did}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Signature
                </Label>
                <Select
                  value={sMethod}
                  defaultValue={config.issueFragment || undefined}
                  onValueChange={(e) => setSMethod(e)}
                  disabled={!sDid}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="#assertion" />
                  </SelectTrigger>
                  <SelectContent>
                    {dids
                      .find((did) => did.did === sDid)
                      ?.method.assertion.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Revocation
                </Label>
                <Select
                  value={sService}
                  defaultValue={config.revokeFragment || undefined}
                  onValueChange={(e) => setSService(e)}
                  disabled={!sDid}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="#service" />
                  </SelectTrigger>
                  <SelectContent>
                    {dids
                      .find((did) => did.did === sDid)
                      ?.service.filter((service) =>
                        service.type.includes("RevocationBitmap2022"),
                      )
                      .map((service) => (
                        <SelectItem
                          key={service.fragment}
                          value={service.fragment}
                        >
                          {service.fragment}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter>
              <Button
                variant={"secondary"}
                onClick={() => {
                  setSDid(config.issueDid || "");
                  setSMethod(config.issueFragment || "");
                  setSService(config.revokeFragment || "");
                }}
              >
                Reset
              </Button>
              <DialogClose asChild>
                <Button
                  type="submit"
                  disabled={
                    !sDid ||
                    !sMethod ||
                    !sService ||
                    (sDid === config.issueDid &&
                      sMethod === config.issueFragment &&
                      sService === config.revokeFragment)
                  }
                  onClick={handleSave}
                >
                  Save
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
