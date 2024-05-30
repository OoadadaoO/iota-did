import { IotaDID, type IotaDocument } from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../../DIDAddress";
import type { DIDWallet } from "../../DIDWallet";

export async function resolveDid(
  this: DIDWallet | DIDAddress,
  didStr: string,
): Promise<IotaDocument> {
  const didClient = await this.getDidClient();

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  return document;
}
