import {
  IotaDID,
  Timestamp,
  type IotaIdentityClient,
  type MethodRelationship,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../../DIDAddress";

export const mapping: Record<MethodRelationship, string> = {
  "0": "authentication",
  "1": "assertionMethod",
  "2": "keyAgreement",
  "3": "capabilityInvocation",
  "4": "capabilityDelegation",
};

export async function insertRelationship(
  this: DIDAddress,
  didString: string,
  fragment: string,
  relationship: MethodRelationship,
) {
  const didClient: IotaIdentityClient = await this.getDidClient();

  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const did = IotaDID.parse(didString);
  const document = await didClient.resolveDid(did);

  document.attachMethodRelationship(did.join(fragment), relationship);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await this.publishDid({ document });
  return { document: published };
}

export async function removeRelationship(
  this: DIDAddress,
  didString: string,
  fragment: string,
  relationship: MethodRelationship,
) {
  const didClient: IotaIdentityClient = await this.getDidClient();

  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const did = IotaDID.parse(didString);
  const document = await didClient.resolveDid(did);

  document.detachMethodRelationship(did.join(fragment), relationship);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await this.publishDid({ document });
  return { document: published };
}
