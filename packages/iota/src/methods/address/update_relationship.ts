import {
  Timestamp,
  type IotaDocument,
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
): Promise<IotaDocument> {
  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const document = await this.resolveDid(didString);
  const did = document.id();

  document.attachMethodRelationship(did.join(fragment), relationship);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const published = await this.publishDid({ document });
  return published;
}

export async function removeRelationship(
  this: DIDAddress,
  didString: string,
  fragment: string,
  relationship: MethodRelationship[],
): Promise<IotaDocument> {
  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const document = await this.resolveDid(didString);
  const did = document.id();

  relationship.forEach((rel) => {
    document.detachMethodRelationship(did.join(fragment), rel);
  });

  document.setMetadataUpdated(Timestamp.nowUTC());
  const published = await this.publishDid({ document });
  return published;
}
