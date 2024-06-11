import { Request } from "express";
import { decodeJwt, JWTPayload } from "jose";

import { getAccountsData, getWalletsData } from "@did/iota";
import { Duration, Jwt, Timestamp } from "@iota/identity-wasm/node";

import { VcDb } from "../../db";
import { env } from "../../env";
import { DIDWallet } from "../../iota";
import { b64uToUtf8 } from "../../utils/base64url";
import { didResponse } from "../../utils/didResponse";
import { Id } from "../../utils/id";
import { TypedResponse } from "../types";
import {
  Account,
  Credential,
  DeleteDidResponse,
  DeleteMethodResponse,
  DeleteServiceResponse,
  DeleteVcResponse,
  GetAccountsResponse,
  GetBalanceResponse,
  GetDidsResponse,
  GetFaucetResponse,
  GetWalletsResponse,
  PatchDidResponse,
  PatchMethodResponse,
  PostAccountsResponse,
  PostDidsResponse,
  PostMethodsResponse,
  PostPasswordResponse,
  PostServicesResponse,
  PostVcsResponse,
  PostVpResponse,
  PostWalletsResponse,
} from "./types";

export const getWallets = async (
  req: Request,
  res: TypedResponse<GetWalletsResponse>,
) => {
  try {
    const wallets = getWalletsData("../../wallet");
    res.status(200).json({ data: { wallets } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postWallets = async (
  req: Request<
    never,
    never,
    { name: string; password: string; mnemonic: string }
  >,
  res: TypedResponse<PostWalletsResponse>,
) => {
  try {
    const name = b64uToUtf8(req.body.name);
    const wallets = getWalletsData("../../wallet");
    if (wallets.find((w) => w.name === name)) {
      return res
        .status(200)
        .json({ error: { code: 403, message: "Wallet already exists" } });
    }
    const password = req.body.password;
    let mnemonic = req.body.mnemonic;
    const clearInterval = req.get("X-Password-Life") || "";
    if (!password || !clearInterval) {
      return res
        .status(200)
        .json({ error: { code: 401, message: "Password is required" } });
    }

    const wallet = await DIDWallet.getInstance(name);
    await wallet.setStrongholdPassword(password);
    await wallet.setStrongholdPasswordClearInterval(
      parseInt(clearInterval, 10),
    );
    wallet.setSecretManagerType((prev) => ({
      stronghold: {
        ...prev.stronghold,
        password,
      },
    }));
    mnemonic = mnemonic ? mnemonic : DIDWallet.generateMnemonic();
    await wallet.storeMnemonic(mnemonic);
    await wallet.getDIDAddress(0, 0);
    res.status(200).json({
      data: {
        wallet: {
          name,
          path: `../../wallet/${name}`,
          mnemonic,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postPassword = async (
  req: Request<{ name: string; wallet: DIDWallet }>,
  res: TypedResponse<PostPasswordResponse>,
) => {
  res.status(200).json({ data: {} });
};

export const getAccounts = async (
  req: Request<{ name: string; wallet: DIDWallet }>,
  res: TypedResponse<GetAccountsResponse>,
) => {
  try {
    const name = b64uToUtf8(req.params.name);
    const wallet = req.params.wallet;
    const accountsData = await getAccountsData(wallet);
    const accounts: Account[] = [];
    await Promise.all(
      accountsData.map(async (data) => {
        const firstAddress = data.addresses.find(
          (a) => a.getMetadata().addressIndex === 0,
        );
        const account = await wallet.getAccount(data.index);
        const [address, balance, accountBalance] = await Promise.all([
          firstAddress?.getBech32Address(),
          firstAddress?.getBalance(),
          account?.getBalance(),
        ]);
        accounts.push({
          name: data.name,
          index: data.index,
          address: address || "",
          balance: balance?.toString() || "0",
          accountBalance: {
            total: accountBalance?.baseCoin.total.toString() || "0",
            available: accountBalance?.baseCoin.available.toString() || "0",
          },
        });
      }),
    );
    res.status(200).json({ data: { name, accounts } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postAccounts = async (
  req: Request<{ name: string; wallet: DIDWallet }>,
  res: TypedResponse<PostAccountsResponse>,
) => {
  try {
    const name = b64uToUtf8(req.params.name);
    const wallet = req.params.wallet;
    const acc = await wallet.createAccount({});
    const meta = acc.getMetadata();
    const didAddress = await wallet.getDIDAddress(meta.index, 0);
    const _account = await wallet.getAccount(meta.index);
    const [address, balance, accountBalance] = await Promise.all([
      didAddress?.getBech32Address(),
      didAddress?.getBalance(),
      _account?.getBalance(),
    ]);
    const account: Account = {
      name: meta.alias,
      index: meta.index,
      address: address || "",
      balance: (balance || 0n).toString(),
      accountBalance: {
        total: accountBalance?.baseCoin.total.toString() || "0",
        available: accountBalance?.baseCoin.available.toString() || "0",
      },
    };
    res.status(200).json({ data: { name, account } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const getBalance = async (
  req: Request<{ name: string; index: number; wallet: DIDWallet }>,
  res: TypedResponse<GetBalanceResponse>,
) => {
  try {
    const wallet = req.params.wallet;
    const address = await wallet.getDIDAddress(req.params.index, 0);
    const balance = await address.getBalance();
    const account = await wallet.getAccount(req.params.index);
    const accountBalance = await account.getBalance();
    res.status(200).json({
      data: {
        balance: balance?.toString() || "0",
        accountBalance: {
          total: accountBalance?.baseCoin.total.toString() || "0",
          available: accountBalance?.baseCoin.available.toString() || "0",
        },
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const getFundsFromFaucet = async (
  req: Request<{ name: string; index: number; wallet: DIDWallet }>,
  res: TypedResponse<GetFaucetResponse>,
) => {
  try {
    const wallet = req.params.wallet;
    const address = await wallet.getDIDAddress(req.params.index, 0);
    await address.requestFunds(env.IOTA_FAUCET_ENDPOINT);

    // wait for funds to be received
    // const origin = (await address.getBalance()) || 0n;
    // let balance = origin;
    // while (balance === origin) {
    //   // Get the balance
    //   balance = (await address.getBalance()) || origin;
    //   if (balance > origin) break;
    //   await new Promise((resolve) => setTimeout(resolve, 500));
    // }
    const account = await wallet.getAccount(req.params.index);
    let accountBalance = await account?.getBalance();
    const origin = accountBalance?.baseCoin.total || 0n;
    let balance = origin;
    while (balance === origin) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      accountBalance = await account?.getBalance();
      balance = accountBalance?.baseCoin.total || origin;
    }
    res.status(200).json({
      data: {
        balance: balance.toString() || "0",
        accountBalance: {
          total: accountBalance?.baseCoin.total.toString() || "0",
          available: accountBalance?.baseCoin.available.toString() || "0",
        },
      },
    });
  } catch (error: any) {
    if ((error?.message as string).includes("enough funds")) {
      return res.status(200).json({
        error: {
          code: 403,
          message: "You already have enough funds on your address.",
        },
      });
    }
    console.log(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const getDIDs = async (
  req: Request<{ name: string; index: number; wallet: DIDWallet }>,
  res: TypedResponse<GetDidsResponse>,
) => {
  try {
    const { name, index, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const dids = await Promise.all(
      (await address.getDids()).map(
        async (doc) => await didResponse(name, doc),
      ),
    );
    res.status(200).json({ data: { dids } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postDIDs = async (
  req: Request<{ name: string; index: number; wallet: DIDWallet }>,
  res: TypedResponse<PostDidsResponse>,
) => {
  try {
    const { name, index, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const doc = await address.createDid();
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const patchDid = async (
  req: Request<
    { name: string; index: number; id: string; wallet: DIDWallet },
    never,
    {
      deactivate: boolean;
    }
  >,
  res: TypedResponse<PatchDidResponse>,
) => {
  try {
    const { name, index, id, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const doc = req.body.deactivate
      ? await address.deactivateDid(id)
      : await address.reactivateDid(id);
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const deleteDid = async (
  req: Request<{ name: string; index: number; id: string; wallet: DIDWallet }>,
  res: TypedResponse<DeleteDidResponse>,
) => {
  try {
    const { index, id, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    await address.deleteDid(id);
    res.status(200).json({ data: {} });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postMethods = async (
  req: Request<{ name: string; index: number; id: string; wallet: DIDWallet }>,
  res: TypedResponse<PostMethodsResponse>,
) => {
  try {
    const { name, index, id, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const doc = await address.insertMethod(id);
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const deleteMethod = async (
  req: Request<{
    name: string;
    index: number;
    id: string;
    frag: string;
    wallet: DIDWallet;
  }>,
  res: TypedResponse<DeleteMethodResponse>,
) => {
  try {
    const { name, index, id, frag, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const doc = await address.removeMethod(id, frag);
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const patchMethod = async (
  req: Request<
    {
      name: string;
      index: number;
      id: string;
      frag: string;
      wallet: DIDWallet;
    },
    never,
    { scope: number }
  >,
  res: TypedResponse<PatchMethodResponse>,
) => {
  try {
    const { name, index, id, frag, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    let doc = await address.removeRelationship(id, frag, [0, 1, 2, 3, 4]);
    if (req.body.scope >= 0 && req.body.scope <= 4) {
      doc = await address.insertRelationship(id, frag, req.body.scope);
    }
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postServices = async (
  req: Request<
    { name: string; index: number; id: string; wallet: DIDWallet },
    never,
    {
      frag: string;
      type: string;
      serviceEndpoint: string;
    }
  >,
  res: TypedResponse<PostServicesResponse>,
) => {
  try {
    const { name, index, id, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const doc =
      req.body.type === "RevocationBitmap2022"
        ? await address.insertRevokeService(id, req.body.frag)
        : await address.insertService(id, req.body.frag, {
            type: req.body.type,
            serviceEndpoint: req.body.serviceEndpoint,
          });
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const deleteService = async (
  req: Request<{
    name: string;
    index: number;
    id: string;
    frag: string;
    wallet: DIDWallet;
  }>,
  res: TypedResponse<DeleteServiceResponse>,
) => {
  try {
    const { name, index, id, frag, wallet } = req.params;
    const address = await wallet.getDIDAddress(index, 0);
    const doc = await address.removeService(id, frag);
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postVcs = async (
  req: Request<
    { name: string; index: number; id: string; wallet: DIDWallet },
    never,
    {
      jwt: string;
    }
  >,
  res: TypedResponse<PostVcsResponse>,
) => {
  try {
    const { name, index, id, wallet } = req.params;
    let rawCredential: JWTPayload;
    try {
      rawCredential = decodeJwt(req.body.jwt);
    } catch (error) {
      return res
        .status(200)
        .json({ error: { code: 400, message: "Invalid JWT" } });
    }
    if (id != rawCredential.sub) {
      return res.status(200).json({
        error: { code: 400, message: "The VC is not for current DID" },
      });
    }
    const credential: Credential = {
      "@context": (rawCredential.vc as any)["@context"],
      id: rawCredential.jti!,
      type: (rawCredential.vc as any).type,
      credentialSubject: {
        id: rawCredential.sub!,
        ...(rawCredential.vc as any).credentialSubject,
      },
      issuer: rawCredential.iss!,
      issuanceDate:
        new Date((rawCredential.iat || rawCredential.nbf)! * 1000)
          .toISOString()
          .split(".")[0] + "Z",
      expirationDate: rawCredential.exp
        ? new Date(rawCredential.exp * 1000).toISOString().split(".")[0] + "Z"
        : undefined,
      credentialStatus: (rawCredential.vc as any).credentialStatus,
    };
    // store vc
    const db = await VcDb.getInstance(name);
    await db.update((data) => {
      const newId = Id();
      data[newId] = {
        id: newId,
        did: id,
        jwt: req.body.jwt,
        credential,
      };
    });
    // create response
    const address = await wallet.getDIDAddress(index, 0);
    const doc = await address.resolveDid(id);
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const deleteVcs = async (
  req: Request<{
    name: string;
    index: number;
    id: string;
    vcId: string;
    wallet: DIDWallet;
  }>,
  res: TypedResponse<DeleteVcResponse>,
) => {
  try {
    const { name, index, id, vcId, wallet } = req.params;
    // delete vc
    const db = await VcDb.getInstance(name);
    await db.update((data) => {
      delete data[vcId];
    });
    // create response
    const address = await wallet.getDIDAddress(index, 0);
    const doc = await address.resolveDid(id);
    const did = await didResponse(name, doc);
    res.status(200).json({ data: { did } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};

export const postVp = async (
  req: Request<
    {
      name: string;
      index: number;
      id: string;
      vcId: string;
      wallet: DIDWallet;
    },
    never,
    {
      fragment: string;
      periodMinutes: number;
    }
  >,
  res: TypedResponse<PostVpResponse>,
) => {
  try {
    const { name, index, id, vcId, wallet } = req.params;
    const db = await VcDb.getInstance(name);
    const vc = db.data[vcId];
    const jwt = new Jwt(vc.jwt);
    const expirationDate = Timestamp.nowUTC().checkedAdd(
      Duration.minutes(req.body.periodMinutes),
    );
    const address = await wallet.getDIDAddress(index, 0);
    const vp = await address.createVP(
      id,
      req.body.fragment,
      {
        holder: id,
        verifiableCredential: [jwt],
      },
      {},
      { expirationDate },
    );
    res.status(200).json({ data: { vp: vp.toString() } });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ error: { code: 500, message: "Internal server error" } });
  }
};
