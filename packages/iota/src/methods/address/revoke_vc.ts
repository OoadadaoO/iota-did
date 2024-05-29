import { IotaDID, type IotaDocument } from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../..";

export async function revokeVC(
  this: DIDAddress,
  issuerDidStr: string,
  issuerRevokeFragment: string,
  issuerRevokeIndex: number | number[],
): Promise<{ document: IotaDocument }> {
  const didClient = await this.getDidClient();

  if (!issuerRevokeFragment.startsWith("#"))
    issuerRevokeFragment = `#${issuerRevokeFragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(issuerDidStr);
  const document = await didClient.resolveDid(did);

  document.revokeCredentials(did.join(issuerRevokeFragment), issuerRevokeIndex);
  const { document: published } = await this.publishDid({ document });

  return { document: published };
}

export async function unrevokeVC(
  this: DIDAddress,
  issuerDidStr: string,
  issuerRevokeFragment: string,
  issuerRevokeIndex: number | number[],
): Promise<{ document: IotaDocument }> {
  const didClient = await this.getDidClient();

  if (!issuerRevokeFragment.startsWith("#"))
    issuerRevokeFragment = `#${issuerRevokeFragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(issuerDidStr);
  const document = await didClient.resolveDid(did);

  document.unrevokeCredentials(
    did.join(issuerRevokeFragment),
    issuerRevokeIndex,
  );
  const { document: published } = await this.publishDid({ document });

  return { document: published };
}
