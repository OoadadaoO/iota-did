"use client";

import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import axios from "axios";
import { Handshake, Loader, Plus, Settings, Stamp } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConfigSchema } from "@/lib/db";
import { cn } from "@/lib/utils/shadcn";
import { DialogClose } from "@radix-ui/react-dialog";

type Props = {
  config: ConfigSchema;
};

export function Auth({ config: dbConfig }: Props) {
  const [config, setConfig] = useState<ConfigSchema>(dbConfig);

  return (
    <div className="relative grid grid-cols-1 gap-4 md:grid-cols-2">
      <EditIssueDialog config={config} setConfig={setConfig} />
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tighter">
            Issue Verifiable Credentials
          </CardTitle>
          <Stamp className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent className="flex flex-col items-stretch gap-4 p-6 pt-0">
          {!config.issuerDid ? (
            <div className="text-muted-foreground text-center">
              No Config Found
            </div>
          ) : (
            <>
              <section>
                <p className="mb-0.5 text-sm">DID</p>
                <div className="text-muted-foreground select-all break-all font-mono leading-tight tracking-tight">
                  {config.issuerDid}
                </div>
              </section>
              <section>
                <p className="mb-0.5 text-sm">Verification Method</p>
                <div className="text-muted-foreground select-all break-all font-mono leading-tight tracking-tight before:content-['#']">
                  {config.issuerFragment}
                </div>
              </section>
              <section>
                <p className="mb-0.5 text-sm">Revocation Service</p>
                <div className="text-muted-foreground select-all break-all font-mono leading-tight tracking-tight before:content-['#']">
                  {config.revokeFragment}
                </div>
              </section>
            </>
          )}
        </CardContent>
      </Card>
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-semibold tracking-tighter">
            Partners
          </CardTitle>
          <Handshake className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent className="flex flex-col items-stretch gap-4 p-6 pt-0">
          {config.allowedIssuers.length === 0 ? (
            <div className="text-muted-foreground text-center">
              No allowed issuers
            </div>
          ) : (
            config.allowedIssuers.map((issuer) => (
              <PartnerDialog
                key={issuer.did}
                isAdd={false}
                issuer={issuer}
                config={config}
                setConfig={setConfig}
              />
            ))
          )}
          <PartnerDialog
            key="add"
            isAdd={true}
            issuer={{ name: "", did: "" }}
            config={config}
            setConfig={setConfig}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function EditIssueDialog({
  config,
  setConfig,
}: {
  config: ConfigSchema;
  setConfig: React.Dispatch<React.SetStateAction<ConfigSchema>>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [dids, setDids] = useState<GetDIDsResponseOk["data"]["dids"] | null>(
    null,
  );
  const [sDid, setSDid] = useState<string>(config.issuerDid || "");
  const [sMethod, setSMethod] = useState<string>(config.issuerFragment || "");
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
      sDid === config.issuerDid &&
      sMethod === config.issuerFragment &&
      sService === config.revokeFragment
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await axios.put<PutConfigResponse>("/api/config", {
        issuerDid: sDid,
        issuerFragment: sMethod,
        revokeFragment: sService,
        allowedIssuers: config.allowedIssuers,
      });

      if (res.data.error) {
        console.error(res.data.error.message);
        setLoading(false);
        return;
      }
      setConfig((prev) => ({
        issuerDid: sDid,
        issuerFragment: sMethod,
        revokeFragment: sService,
        allowedIssuers: prev.allowedIssuers,
      }));
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
          <Settings
            className={cn(
              "group-hover:stroke-foreground stroke-1 transition-transform",
              loading && "animate-spin ease-in-out",
            )}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Issue Configuration</DialogTitle>
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
                  defaultValue={config.issuerDid || undefined}
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
                  defaultValue={config.issuerFragment || undefined}
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
                disabled={
                  sDid === config.issuerDid &&
                  sMethod === config.issuerFragment &&
                  sService === config.revokeFragment
                }
                onClick={() => {
                  setSDid(config.issuerDid || "");
                  setSMethod(config.issuerFragment || "");
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
                    (sDid === config.issuerDid &&
                      sMethod === config.issuerFragment &&
                      sService === config.revokeFragment)
                  }
                  onClick={handleSave}
                >
                  {loading ? <Loader className="animate-spin" /> : "Save"}
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PartnerDialog({
  isAdd,
  issuer,
  config,
  setConfig,
}: {
  isAdd: boolean;
  issuer: ConfigSchema["allowedIssuers"][number];
  config: ConfigSchema;
  setConfig: React.Dispatch<React.SetStateAction<ConfigSchema>>;
}) {
  const [sName, setSName] = useState<string>(issuer.name);
  const [sDid, setSDid] = useState<string>(issuer.did);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSave = async () => {
    if (!sName || !sDid || (sName === issuer.name && sDid === issuer.did))
      return;
    try {
      setLoading(true);
      const newAllowedIssuers = [
        ...config.allowedIssuers.filter(
          (i) => i.did !== sDid || i.name !== sName,
        ),
        { name: sName, did: sDid },
      ];
      const res = await axios.put<PutConfigResponse>("/api/config", {
        ...config,
        allowedIssuers: newAllowedIssuers,
      });

      if (res.data.error) {
        console.error(res.data.error.message);
        setLoading(false);
        return;
      }
      setConfig((prev) => ({
        ...prev,
        allowedIssuers: newAllowedIssuers,
      }));
      if (isAdd) {
        setSName("");
        setSDid("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const newAllowedIssuers = config.allowedIssuers.filter(
        (i) => i.did !== issuer.did || i.name !== issuer.name,
      );
      const res = await axios.put<PutConfigResponse>("/api/config", {
        ...config,
        allowedIssuers: newAllowedIssuers,
      });

      if (res.data.error) {
        console.error(res.data.error.message);
        setLoading(false);
        return;
      }
      setConfig((prev) => ({
        ...prev,
        allowedIssuers: newAllowedIssuers,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isAdd ? (
          <Button variant={"outline"} className="group p-4">
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <Plus className="group-hover:stroke-foreground stroke-muted-foreground stroke-1 transition-transform" />
            )}
          </Button>
        ) : (
          <section className="cursor-pointer hover:underline hover:underline-offset-2">
            <p className="mb-0.5 text-sm">{issuer.name}</p>
            <div className="text-muted-foreground break-all font-mono leading-tight tracking-tight">
              {issuer.did}
            </div>
          </section>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isAdd ? "Add Partner" : "Edit Partner"}</DialogTitle>
          <DialogDescription>
            {isAdd
              ? "Add a new partner to the list of allowed issuers."
              : "Edit the partner's name and DID."}
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              className="col-span-3"
              placeholder="Name of partner"
              value={sName}
              onChange={(e) => setSName(e.target.value.trim())}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="did" className="text-right">
              DID
            </Label>
            <Input
              type="text"
              id="did"
              name="did"
              className="col-span-3"
              placeholder="iota:did"
              value={sDid}
              onChange={(e) => setSDid(e.target.value.trim())}
            />
          </div>
        </form>
        <DialogFooter className="m-0 flex w-full items-center justify-between sm:justify-between">
          <div>
            {!isAdd && (
              <DialogClose asChild>
                <Button variant={"destructive"} onClick={handleDelete}>
                  Delete
                </Button>
              </DialogClose>
            )}
          </div>
          <div className="space-x-4">
            <Button
              variant={"secondary"}
              disabled={sName === issuer.name && sDid === issuer.did}
              onClick={() => {
                setSName(issuer.name);
                setSDid(issuer.did);
              }}
            >
              Reset
            </Button>
            <DialogClose asChild>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !sName ||
                  !sDid ||
                  (sName === issuer.name && sDid === issuer.did)
                }
                onClick={handleSave}
              >
                {loading ? <Loader className="animate-spin" /> : "Save"}
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
