"use client";

import { useEffect, useState } from "react";
import { CodeBlock, monokaiSublime, solarizedLight } from "react-code-blocks";

import axios from "axios";
import {
  BetweenHorizonalEnd,
  Clipboard,
  CodeXml,
  FilePenLine,
  FilePlus2,
  FileX2,
  Loader,
  LoaderCircle,
  Power,
  PowerOff,
  Send,
} from "lucide-react";

import type {
  GetDidsResponse,
  GetDidsResponseOk,
  GetFaucetResponse,
  PostDidsResponse,
  PostVcsResponse,
} from "@/app/api/type";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { beautifyJson } from "@/lib/utils/beautifyCode";
import { cn } from "@/lib/utils/shadcn";
import type {
  Account,
  DeleteDidResponse,
  PatchDidResponse,
  PostServicesResponse,
  PostVpResponse,
} from "@did/wallet-server/types";

type Did = GetDidsResponseOk["data"]["dids"][number];
type Props = {
  name: string;
  selectedAcc: Account;
  setSelectedAcc: React.Dispatch<React.SetStateAction<Account>>;
  setAccs: React.Dispatch<React.SetStateAction<Account[]>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
  reload: boolean;
};

const defaultDid: Did = {
  did: "",
  method: [],
  service: [],
  vc: [],
  deactive: false,
  json: {},
  metadata: {},
};

export function Dashboard({
  name,
  selectedAcc,
  setSelectedAcc,
  setAccs,
  setNeedLogin,
  reload,
}: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [dids, setDids] = useState<Did[]>([]);
  const [selectedDid, setSelectedDid] = useState<Did>(defaultDid);

  useEffect(() => {
    if (selectedAcc.address === "") return;
    const getDids = async () => {
      try {
        setLoading(true);
        const res = await axios.get<GetDidsResponse>(
          `/api/iota/wallets/${name}/accounts/${selectedAcc.index}/dids`,
        );
        if (res.data.error) {
          if (res.data.error.code === 401) {
            setNeedLogin((prev) => prev + 1);
          }
          throw new Error(res.data.error.message);
        }
        setDids(res.data.data.dids);
        setSelectedDid(res.data.data.dids?.[0] || defaultDid);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getDids();
  }, [selectedAcc, name, setNeedLogin, reload]);

  return (
    <div className="flex h-full flex-col items-stretch gap-4 p-6 xl:grid xl:grid-cols-3">
      <div className="grid grid-cols-2 gap-4 xl:flex xl:flex-col xl:items-stretch">
        <section className="bg-foreground/10 text-foreground col-span-2 rounded-2xl">
          <div className="p-6">
            <div className="text-sm font-bold">Available Balance</div>
          </div>
          <div className="p-6 pt-0">
            <div className="flex w-full text-3xl font-bold">
              <p className="mr-2 truncate">
                {parseFloat(selectedAcc.accountBalance.total) / 10 ** 6}
              </p>
              <p>TST</p>
            </div>
            <p className="text-muted-foreground text-sm">
              {parseFloat(selectedAcc.accountBalance.available) / 10 ** 6} TST
              is available, other TST is in storage deposits.
            </p>
          </div>
        </section>
        <section className="bg-foreground/10 text-foreground rounded-2xl">
          <div className="p-6">
            <div className="text-sm font-bold">Deposit</div>
          </div>
          <div className="flex flex-col items-stretch gap-3 p-6 pt-0">
            {/* <CopyAddressButton address={selectedAcc.address} /> */}
            <GetFundsButton
              name={name}
              index={selectedAcc.index}
              setNeedLogin={setNeedLogin}
              setSelectedAcc={setSelectedAcc}
              setAccs={setAccs}
            />
          </div>
        </section>
        <section className="bg-foreground/10 text-foreground rounded-2xl">
          <div className="p-6">
            <div className="text-sm font-bold">Withdraw</div>
          </div>
          <div className="p-6 pt-0">
            <Button
              variant={"outline"}
              className="hover:bg-background/20 border-foreground/50 w-full truncate bg-transparent"
              disabled
            >
              Send to an address
            </Button>
          </div>
        </section>
      </div>

      <ScrollArea className="bg-foreground/10 text-foreground flex-1 rounded-2xl xl:col-span-2">
        <div className="w-[calc(100vw-368px)] xl:w-[calc((100vw-400px)*2/3+16px)]">
          <div className="flex h-[68px] items-center justify-between gap-2 p-6">
            <div className="text-sm font-bold">Decentralized IDentity</div>
            <div>
              <PatchDIDButton
                name={name}
                index={selectedAcc.index}
                selectedDid={selectedDid}
                setDids={setDids}
                setSelectedDid={setSelectedDid}
                setNeedLogin={setNeedLogin}
              />
              <DeleteDIDButton
                name={name}
                index={selectedAcc.index}
                dids={dids}
                selectedDid={selectedDid}
                setDids={setDids}
                setSelectedDid={setSelectedDid}
                setNeedLogin={setNeedLogin}
              />
              <AddDIDButton
                name={name}
                index={selectedAcc.index}
                setDids={setDids}
                setSelectedDid={setSelectedDid}
                setNeedLogin={setNeedLogin}
              />
            </div>
          </div>
          <div className="space-y-3 p-6 pt-0">
            <DIDSelector
              loading={loading}
              dids={dids}
              selectedDid={selectedDid}
              setSelectedDid={setSelectedDid}
            />
            <Accordion
              type="multiple"
              defaultValue={["method", "service", "vc"]}
              className="w-full"
            >
              <AccordionItem value="method" className="border-0">
                <AccordionTrigger>
                  Verification Method
                  <div></div>
                </AccordionTrigger>
                <MethodsContent
                  name={name}
                  index={selectedAcc.index}
                  selectedDid={selectedDid}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              </AccordionItem>
              <AccordionItem value="service" className="border-0">
                <AccordionTrigger>Service</AccordionTrigger>
                <ServicesContent
                  name={name}
                  index={selectedAcc.index}
                  selectedDid={selectedDid}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              </AccordionItem>
              <AccordionItem value="vc" className="border-0">
                <AccordionTrigger>Verifiable Credential</AccordionTrigger>
                <VcsContent
                  name={name}
                  index={selectedAcc.index}
                  selectedDid={selectedDid}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              </AccordionItem>
              <AccordionItem value="document" className="border-0">
                <AccordionTrigger>Document</AccordionTrigger>
                <AccordionContent className="font-mono">
                  <JsonCode code={beautifyJson(selectedDid?.json)} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="metadata" className="border-0">
                <AccordionTrigger>Metadata</AccordionTrigger>
                <AccordionContent className="font-mono">
                  <JsonCode code={beautifyJson(selectedDid?.metadata)} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}

// function CopyAddressButton({ address }: { address: string }) {
//   return (
//     <Button
//       variant={"outline"}
//       className="hover:bg-background/20 border-foreground/50 w-full truncate bg-transparent px-2"
//       onClick={() => {
//         navigator.clipboard.writeText(address);
//       }}
//     >
//       Copy the address
//     </Button>
//   );
// }

function GetFundsButton({
  name,
  index,
  setSelectedAcc,
  setAccs,
  setNeedLogin,
}: {
  name: string;
  index: number;
  setSelectedAcc: React.Dispatch<React.SetStateAction<Account>>;
  setAccs: React.Dispatch<React.SetStateAction<Account[]>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={"outline"}
      className="hover:bg-background/20 border-foreground/50 w-full truncate bg-transparent"
      disabled={loading}
      onClick={async () => {
        try {
          setLoading(true);
          const res = await axios.get<GetFaucetResponse>(
            `/api/iota/wallets/${name}/accounts/${index}/faucet`,
            { timeout: 60000 },
          );
          if (res.data.error) {
            alert(res.data.error.message);

            if (res.data.error.code === 401) {
              setNeedLogin((prev) => prev + 1);
            }
            return;
          }
          const { balance, accountBalance } = res.data.data;
          setSelectedAcc((prev) => ({
            ...prev,
            balance,
            accountBalance,
          }));
          setAccs((prev) =>
            prev.map((acc) =>
              acc.index === index
                ? {
                    ...acc,
                    balance,
                    accountBalance,
                  }
                : acc,
            ),
          );
        } catch (error) {
          alert("Failed to request funds from faucet");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader size={24} className="animate-spin" />
      ) : (
        "Request from FAUCET"
      )}
    </Button>
  );
}

function PatchDIDButton({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className="hover:bg-background/20 group"
      disabled={loading}
      onClick={async (e) => {
        e.preventDefault();
        try {
          setLoading(true);
          const res = await axios.patch<PatchDidResponse>(
            `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}`,
            { deactivate: !selectedDid.deactive },
          );
          if (res.data.error) {
            alert(res.data.error.message);

            if (res.data.error.code === 401) {
              setNeedLogin((prev) => prev + 1);
            }
            return;
          }
          const did = res.data.data.did;
          setSelectedDid(did);
          setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
        } catch (error) {
          console.error(error);
          alert("Failed to change the status of the DID");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader size={20} className="animate-spin" />
      ) : selectedDid.deactive ? (
        <Power size={20} className="group-hover:text-green-500" />
      ) : (
        <PowerOff size={20} className="group-hover:text-red-500" />
      )}
    </Button>
  );
}

function DeleteDIDButton({
  name,
  index,
  dids,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  dids: Did[];
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className="hover:bg-background/20 group"
      disabled={loading}
      onClick={async (e) => {
        e.preventDefault();
        try {
          setLoading(true);
          const targetId = selectedDid.did;
          const res = await axios.delete<DeleteDidResponse>(
            `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}`,
          );
          if (res.data.error) {
            alert(res.data.error.message);

            if (res.data.error.code === 401) {
              setNeedLogin((prev) => prev + 1);
            }
            return;
          }
          setSelectedDid(dids.find((d) => d.did !== targetId) || defaultDid);
          setDids((prev) => prev.filter((d) => d.did !== targetId));
        } catch (error) {
          console.error(error);
          alert("Failed to delete the DID");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader size={20} className="animate-spin" />
      ) : (
        <FileX2 size={20} className="group-hover:text-red-500" />
      )}
    </Button>
  );
}

function AddDIDButton({
  name,
  index,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className="hover:bg-background/20"
      disabled={loading}
      onClick={async (e) => {
        e.preventDefault();
        try {
          setLoading(true);
          const res = await axios.post<PostDidsResponse>(
            `/api/iota/wallets/${name}/accounts/${index}/dids`,
          );
          if (res.data.error) {
            alert(res.data.error.message);

            if (res.data.error.code === 401) {
              setNeedLogin((prev) => prev + 1);
            }
            return;
          }
          const did = res.data.data.did;
          setSelectedDid(did);
          setDids((prev) => [...prev, did]);
        } catch (error) {
          console.error(error);
          alert("Failed to create a new DID");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader size={20} className="animate-spin" />
      ) : (
        <FilePlus2 size={20} />
      )}
    </Button>
  );
}

function DIDSelector({
  loading,
  dids,
  selectedDid,
  setSelectedDid,
}: {
  loading: boolean;
  dids: Did[];
  selectedDid: Did;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
}) {
  return (
    <Select
      value={selectedDid?.did || ""}
      onValueChange={(e) =>
        setSelectedDid(dids.find((did) => did.did === e) || defaultDid)
      }
    >
      <SelectTrigger className="border-foreground/50 space-x-2 bg-transparent font-mono">
        <SelectValue
          placeholder={loading ? "Loading" : "Select a DID"}
          className=""
        />
      </SelectTrigger>
      <SelectContent className="bg-transparent backdrop-blur-xl">
        {dids.map((did) => (
          <SelectItem key={did.did} value={did.did} className="font-mono">
            <div className="flex items-center justify-start gap-2">
              {did.deactive ? (
                <PowerOff size={16} className="w-4 min-w-4 text-red-500" />
              ) : (
                <Power size={16} className="w-4 min-w-4 text-green-500" />
              )}
              <p>{did.did}</p>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const scopes = [
  { value: -1, label: "-" },
  { value: 0, label: "Authentication" },
  { value: 1, label: "AssertionMethod" },
  { value: 2, label: "KeyAgreement" },
  { value: 3, label: "CapabilityDelegation" },
  { value: 4, label: "CapabilityInvocation" },
];

function MethodsContent({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const methods = selectedDid?.method || [];
  // if (methods.length === 0) return null;
  return (
    <AccordionContent>
      <ScrollArea className="bg-background/25 rounded-md py-2">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-border text-muted-foreground border-b">
              <th className="px-2 pl-4 text-left text-sm font-normal">
                Fragment
              </th>
              <th className="px-2 text-left text-sm font-normal">
                Relationship
              </th>
              <th className="w-10 px-2 text-center text-sm font-normal"></th>
              <th className="w-10 px-2 pr-4 text-center text-sm font-normal">
                <AddMethodButton
                  name={name}
                  index={index}
                  selectedDid={selectedDid}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {methods.map((method) => {
              return (
                <MethodRow
                  key={method.fragment}
                  method={method}
                  name={name}
                  index={index}
                  selectedDid={selectedDid}
                  fragment={method.fragment}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              );
            })}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </AccordionContent>
  );
}

function AddMethodButton({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      className="hover:bg-background/0 w-6"
      disabled={loading}
      onClick={async (e) => {
        e.preventDefault();
        try {
          setLoading(true);
          const res = await axios.post<PostServicesResponse>(
            `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/methods`,
          );
          if (res.data.error) {
            alert(res.data.error.message);

            if (res.data.error.code === 401) {
              setNeedLogin((prev) => prev + 1);
            }
            return;
          }
          const did = res.data.data.did;
          setSelectedDid(did);
          setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
        } catch (error) {
          console.error(error);
          alert("Failed to create a new Methods");
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? (
        <Loader size={20} className="animate-spin" />
      ) : (
        <BetweenHorizonalEnd size={20} />
      )}
    </Button>
  );
}

function MethodRow({
  method,
  name,
  index,
  selectedDid,
  fragment,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  method: Did["method"][number];
  name: string;
  index: number;
  selectedDid: Did;
  fragment: string;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const methodJson = beautifyJson(method.json);
  const originScope = (
    scopes.find((s) => s.label === method.relationship)?.value || -1
  ).toString();
  const [loading, setLoading] = useState(false);
  const [scope, setScope] = useState<string>(originScope);
  const handlePatch = async () => {
    try {
      setLoading(true);
      const res = await axios.patch<PatchDidResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/methods/${fragment}`,
        { scope: parseInt(scope) },
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
    } catch (error) {
      console.error(error);
      alert("Failed to update the method");
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete<PatchDidResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/methods/${fragment}`,
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
    } catch (error) {
      console.error(error);
      alert("Failed to delete the method");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr key={method.fragment} className="border-border border-b">
      <td className="p-2 pl-4">
        <h3
          className="select-none break-all font-mono hover:cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(method.fragment);
          }}
        >
          {method.fragment}
        </h3>
      </td>
      <td className="p-2">
        <p className="text-sm">{method.relationship}</p>
      </td>
      <td className="p-2 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CodeXml size={16} className="mx-auto hover:cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-muted relative max-w-screen-sm backdrop-blur-xl lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl"
            side={"left"}
          >
            <Clipboard
              size={16}
              className="hover:text-foreground text-muted-foreground absolute right-4 top-4 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(methodJson);
              }}
            />
            <JsonCode code={methodJson} />
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
      <td className="hover:text-foreground text-muted-foreground w-10 p-2 pr-4 text-center hover:cursor-pointer">
        <Popover>
          <PopoverTrigger asChild>
            {loading ? (
              <LoaderCircle className="mx-auto h-4 w-4 animate-spin ease-in-out" />
            ) : (
              <FilePenLine className="mx-auto h-4 w-4" />
            )}
          </PopoverTrigger>
          <PopoverContent className="max-w-lg md:max-w-2xl" side="left">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">
                  Delete / Edit Method
                </h4>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="scope">Scope</Label>
                  <Select value={scope} onValueChange={(e) => setScope(e)}>
                    <SelectTrigger className="col-span-2 bg-transparent">
                      <SelectValue placeholder="Select a Scope" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopes.map((s) => (
                        <SelectItem key={s.value} value={s.value.toString()}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 items-center">
                <Button
                  variant={"outline"}
                  className={`${scope === originScope ? "hover:bg-destructive/60 bg-destructive/40" : "hover:bg-muted/80 bg-muted/40"}`}
                  onClick={scope === originScope ? handleDelete : handlePatch}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader className="animate-spin" />
                  ) : scope === originScope ? (
                    "Delete"
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
    </tr>
  );
}

function ServicesContent({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const services = selectedDid?.service || [];
  // if (services.length === 0) return null;
  return (
    <AccordionContent>
      <ScrollArea className="bg-background/25 rounded-md py-2">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-border text-muted-foreground border-b">
              <th className="px-2 pl-4 text-left text-sm font-normal">
                Fragment
              </th>
              <th className="px-2 text-left text-sm font-normal">Type</th>
              <th className="px-2 text-left text-sm font-normal">Endpoint</th>
              <th className="w-10 px-2 text-center text-sm font-normal"></th>
              <th className="w-10 px-2 pr-4 text-center text-sm font-normal">
                <AddServiceButton
                  name={name}
                  index={index}
                  selectedDid={selectedDid}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              return (
                <ServiceRow
                  key={service.fragment}
                  service={service}
                  name={name}
                  index={index}
                  selectedDid={selectedDid}
                  fragment={service.fragment}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              );
            })}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </AccordionContent>
  );
}

function AddServiceButton({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);
  const [frag, setFrag] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [endpoint, setEndpoint] = useState<string>("");

  const handleGeneralSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!frag || !type || !endpoint) return;
    try {
      setLoading(true);
      const res = await axios.post<PostServicesResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/services`,
        { frag, type, serviceEndpoint: endpoint },
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
      setFrag("");
      setType("");
      setEndpoint("");
    } catch (error) {
      console.error(error);
      alert("Failed to add a new service");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!frag) return;
    try {
      setLoading(true);
      const res = await axios.post<PostServicesResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/services`,
        { frag, type: "RevocationBitmap2022" },
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
      setFrag("");
    } catch (error) {
      console.error(error);
      alert("Failed to add a new revocation service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="hover:bg-background/0 w-6"
        >
          {loading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <BetweenHorizonalEnd size={20} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg border-0 bg-transparent shadow-none">
        <Tabs defaultValue="general" className="max-w-lg">
          <TabsList className="bg-background text-muted-foreground grid w-full grid-cols-2">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="revoke"
              className="data-[state=active]:bg-muted data-[state=active]:text-foreground"
            >
              RevocationBitmap2022
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="bg-background rounded-md">
            <div className="p-6 text-xl font-bold">
              Add Service
              <p className="text-muted-foreground text-sm font-normal">
                Add a new service to the DID
              </p>
            </div>
            <form
              className="grid gap-4 p-6 pt-0"
              onSubmit={handleGeneralSubmit}
            >
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="fragment">Fragment</Label>
                <Input
                  id="fragment"
                  placeholder="Name to identify the service"
                  className="col-span-2 h-10"
                  value={frag}
                  onChange={(e) => setFrag(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  placeholder="Type of the service"
                  className="col-span-2 h-10"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="endpoint">Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="Endpoint of the service"
                  className="col-span-2 h-10"
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                />
              </div>
              <div className="grid gap-2 pt-2">
                <Button
                  variant={"outline"}
                  className="hover:bg-accent/60 bg-accent/40"
                  type="submit"
                  disabled={loading || !frag || !type || !endpoint}
                >
                  {loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Add Service"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="revoke" className="bg-background rounded-md">
            <div className="p-6 text-xl font-bold">
              Add Service
              <p className="text-muted-foreground text-sm font-normal">
                Add a new service to the DID
              </p>
            </div>
            <form className="grid gap-4 p-6 pt-0" onSubmit={handleRevokeSubmit}>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="fragment">Fragment</Label>
                <Input
                  id="fragment"
                  placeholder="Name to identify the service"
                  className="col-span-2 h-10"
                  value={frag}
                  onChange={(e) => setFrag(e.target.value)}
                />
              </div>
              <div className="grid gap-2 pt-2">
                <Button
                  variant={"outline"}
                  className="hover:bg-accent/60 bg-accent/40"
                  type="submit"
                  disabled={loading || !frag}
                >
                  {loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Add Service"
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ServiceRow({
  service,
  name,
  index,
  selectedDid,
  fragment,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  service: Did["service"][number];
  name: string;
  index: number;
  selectedDid: Did;
  fragment: string;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const serviceJson = beautifyJson(service.json);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete<PatchDidResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/services/${fragment}`,
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
    } catch (error) {
      console.error(error);
      alert("Failed to delete the service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr key={service.fragment} className="border-border border-b">
      <td className="p-2 pl-4">
        <h3 className="select-all break-all font-mono text-sm">
          {service.fragment}
        </h3>
      </td>
      <td className="p-2">
        <p className="text-sm">{service.type}</p>
      </td>
      <td className="p-2">
        <a
          className="hover:text-accent-foreground break-all text-sm hover:underline hover:underline-offset-2"
          href={service.endpoint}
          target="_blank"
          rel="noreferrer"
        >
          {service.endpoint}
        </a>
      </td>
      <td className="p-2 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CodeXml size={16} className="mx-auto hover:cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-muted relative max-w-screen-sm backdrop-blur-xl lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl"
            side={"left"}
          >
            <Clipboard
              size={16}
              className="hover:text-foreground text-muted-foreground absolute right-4 top-4 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(serviceJson);
              }}
            />
            <JsonCode code={serviceJson} />
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
      <td className="hover:text-foreground text-muted-foreground w-10 p-2 pr-4 text-center hover:cursor-pointer">
        <Popover>
          <PopoverTrigger asChild>
            {loading ? (
              <LoaderCircle className="mx-auto h-4 w-4 animate-spin ease-in-out" />
            ) : (
              <FilePenLine className="mx-auto h-4 w-4" />
            )}
          </PopoverTrigger>
          <PopoverContent className="max-w-lg md:max-w-2xl" side="left">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Delete Service</h4>
              </div>
              <div className="grid grid-cols-1 items-center">
                <Button
                  variant={"outline"}
                  className="hover:bg-destructive/60 bg-destructive/40"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <Loader className="animate-spin" /> : "Delete"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
    </tr>
  );
}

function VcsContent({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const vcs = selectedDid?.vc || [];
  // if (vcs.length === 0) return null;
  return (
    <AccordionContent>
      <ScrollArea className="bg-background/25 rounded-md py-2">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border-border text-muted-foreground border-b">
              <th className="px-2 pl-4 text-left text-sm font-normal">
                Context
              </th>
              <th className="px-2 text-left text-sm font-normal">Types</th>
              <th className="px-2 text-left text-sm font-normal">Issuer</th>
              <th className="w-10 px-2 text-center text-sm font-normal"></th>
              <th className="w-10 px-2 text-center text-sm font-normal"></th>
              <th className="w-10 px-2 pr-4 text-center text-sm font-normal">
                <AddVcButton
                  name={name}
                  index={index}
                  selectedDid={selectedDid}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {vcs.map((vc) => {
              return (
                <VcRow
                  key={vc.id}
                  name={name}
                  index={index}
                  selectedDid={selectedDid}
                  vc={vc}
                  vcId={vc.id}
                  setDids={setDids}
                  setSelectedDid={setSelectedDid}
                  setNeedLogin={setNeedLogin}
                />
              );
            })}
          </tbody>
        </table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </AccordionContent>
  );
}

function AddVcButton({
  name,
  index,
  selectedDid,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);
  const [jwt, setJwt] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post<PostVcsResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/vcs`,
        { jwt },
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
      setJwt("");
    } catch (error) {
      console.error(error);
      alert("Failed to add a new VC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(o) => !o && setJwt("")}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="hover:bg-background/0 w-6"
        >
          {loading ? (
            <Loader size={20} className="animate-spin" />
          ) : (
            <BetweenHorizonalEnd size={20} />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-background max-w-lg border-0 shadow-none">
        <div className="text-xl font-bold">
          Add Verifiable Credential
          <p className="text-muted-foreground text-sm font-normal">
            Store your VC in wallet
          </p>
        </div>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="jwt">JWT</Label>
            <Textarea
              id="jwt"
              placeholder="JWT format of the VC"
              className="col-span-2 h-48"
              value={jwt}
              onChange={(e) => setJwt(e.target.value)}
            />
          </div>
          <div className="grid gap-2 pt-2">
            <Button
              variant={"outline"}
              className="hover:bg-accent/60 bg-accent/40"
              type="submit"
              disabled={loading || !jwt}
            >
              {loading ? <Loader className="animate-spin" /> : "Store VC"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GenVpButton({
  name,
  index,
  selectedDid,
  vcId,
  setNeedLogin,
}: {
  name: string;
  index: number;
  selectedDid: Did;
  vcId: string;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loading, setLoading] = useState(false);
  const [fragment, setFragment] = useState<string>("");
  const [periodMinutes, setPeriodMinutes] = useState<number>(10);
  const [vp, setVp] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fragment || !periodMinutes) return;
    try {
      setLoading(true);
      const res = await axios.post<PostVpResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/vcs/${vcId}/vp`,
        { periodMinutes, fragment },
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      setVp(res.data.data.vp);
    } catch (error) {
      console.error(error);
      alert("Failed to create a new VP");
    } finally {
      setLoading(false);
    }
  };

  const handleDialog = (o: boolean) => {
    !o && setVp("");
    !o && setPeriodMinutes(10);
    !o && setFragment("");
  };

  return (
    <Dialog onOpenChange={handleDialog}>
      <DialogTrigger asChild>
        <Button
          variant={"ghost"}
          size={"icon"}
          className="hover:bg-background/0 group w-6"
        >
          {loading ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Send
              size={16}
              className="group-hover:text-foreground text-muted-foreground"
            />
          )}
        </Button>
      </DialogTrigger>
      {vp ? (
        <DialogContent className="bg-background max-w-lg border-0 shadow-none">
          <div className="text-xl font-bold">
            Prepare Verifiable Presentation
            <p className="text-muted-foreground text-sm font-normal">
              Make a VP from the VC
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <Textarea
              id="vp"
              placeholder="Verifiable Presentation"
              className="h-48"
              value={vp}
              readOnly
            />
            <div className="grid gap-2 pt-2">
              <Button
                variant={"outline"}
                className="hover:bg-accent/60 bg-accent/40"
                type="submit"
                disabled={loading}
              >
                Create a new VP
              </Button>
            </div>
          </form>
        </DialogContent>
      ) : (
        <DialogContent className="bg-background max-w-lg border-0 shadow-none">
          <div className="text-xl font-bold">
            Prepare Verifiable Presentation
            <p className="text-muted-foreground text-sm font-normal">
              Make a VP from the VC
            </p>
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="fragment">Method</Label>
              <Select value={fragment} onValueChange={(e) => setFragment(e)}>
                <SelectTrigger
                  id="fragment"
                  className="col-span-2 bg-transparent"
                >
                  <SelectValue placeholder="Select a method to sign the VP" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDid.method
                    .filter(
                      (m) =>
                        m.relationship === "-" ||
                        m.relationship === "AssertionMethod",
                    )
                    .map((s) => (
                      <SelectItem key={s.fragment} value={s.fragment}>
                        {s.fragment}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="period">Validity Period (min)</Label>
              <Input
                id="period"
                type="text"
                placeholder="Validity Period"
                className="col-span-2 h-10"
                value={periodMinutes}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  value > 0 && setPeriodMinutes(value);
                }}
              />
            </div>
            <div className="grid gap-2 pt-2">
              <Button
                variant={"outline"}
                className="hover:bg-accent/60 bg-accent/40"
                type="submit"
                disabled={loading || !fragment || !periodMinutes}
              >
                {loading ? <Loader className="animate-spin" /> : "Prepare VP"}
              </Button>
            </div>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}

function VcRow({
  vc,
  name,
  index,
  selectedDid,
  vcId,
  setDids,
  setSelectedDid,
  setNeedLogin,
}: {
  vc: Did["vc"][number];
  name: string;
  index: number;
  selectedDid: Did;
  vcId: string;
  setDids: React.Dispatch<React.SetStateAction<Did[]>>;
  setSelectedDid: React.Dispatch<React.SetStateAction<Did>>;
  setNeedLogin: React.Dispatch<React.SetStateAction<number>>;
}) {
  const credential = beautifyJson(vc.credential);
  const [loading, setLoading] = useState<boolean>(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      const res = await axios.delete<PatchDidResponse>(
        `/api/iota/wallets/${name}/accounts/${index}/dids/${selectedDid.did}/vcs/${vcId}`,
      );
      if (res.data.error) {
        alert(res.data.error.message);

        if (res.data.error.code === 401) {
          setNeedLogin((prev) => prev + 1);
        }
        return;
      }
      const did = res.data.data.did;
      setSelectedDid(did);
      setDids((prev) => prev.map((d) => (d.did === did.did ? did : d)));
    } catch (error) {
      console.error(error);
      alert("Failed to delete the VC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="border-border border-b">
      <td className="p-2 pl-4">
        <a
          className="select-all break-all text-sm hover:underline hover:underline-offset-2"
          href={vc.credential.id}
          target="_blank"
          rel="noreferrer"
        >
          {vc.credential.id}
        </a>
      </td>
      <td className="p-2">
        <p className="text-sm">{vc.credential.type.join(", ")}</p>
      </td>
      <td className="p-2">
        <p className="break-all font-mono text-sm">{vc.credential.issuer}</p>
      </td>
      <td className="p-2 text-center">
        <GenVpButton
          name={name}
          index={index}
          selectedDid={selectedDid}
          vcId={vcId}
          setNeedLogin={setNeedLogin}
        />
      </td>
      <td className="p-2 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CodeXml size={16} className="mx-auto hover:cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-muted relative max-w-screen-sm backdrop-blur-xl lg:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl"
            side={"left"}
          >
            <Clipboard
              size={16}
              className="hover:text-foreground text-muted-foreground absolute right-4 top-4 cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(credential);
              }}
            />
            <JsonCode code={credential} />
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
      <td className="hover:text-foreground text-muted-foreground w-10 p-2 pr-4 text-center hover:cursor-pointer">
        <Popover>
          <PopoverTrigger asChild>
            {loading ? (
              <LoaderCircle className="mx-auto h-4 w-4 animate-spin ease-in-out" />
            ) : (
              <FilePenLine className="mx-auto h-4 w-4" />
            )}
          </PopoverTrigger>
          <PopoverContent className="max-w-lg md:max-w-2xl" side="left">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Delete VC</h4>
              </div>
              <div className="grid grid-cols-1 items-center">
                <Button
                  variant={"outline"}
                  className="hover:bg-destructive/60 bg-destructive/40"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? <Loader className="animate-spin" /> : "Delete"}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </td>
    </tr>
  );
}

function JsonCode({ code, className }: { code: string; className?: string }) {
  return (
    <>
      <div className={cn("hidden font-mono dark:block", className)}>
        <CodeBlock
          text={code}
          language={"json"}
          showLineNumbers={false}
          theme={monokaiSublime}
          // codeBlock
        />
      </div>
      <div className={cn("block font-mono dark:hidden", className)}>
        <CodeBlock
          text={code}
          language={"json"}
          showLineNumbers={false}
          theme={solarizedLight}
          // codeBlock
        />
      </div>
    </>
  );
}
