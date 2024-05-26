// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { IotaClient } from "..";

import {
  IotaDID,
  Timestamp,
  type MethodRelationship,
} from "@iota/identity-wasm/node/index";

export const mapping: Record<MethodRelationship, string> = {
  "0": "authentication",
  "1": "assertionMethod",
  "2": "keyAgreement",
  "3": "capabilityInvocation",
  "4": "capabilityDelegation",
};

export async function insertRelationship(
  this: IotaClient,
  didStr: string,
  fragment: string,
  relationship: MethodRelationship,
) {
  const { didClient, db, publishDid } = this;

  // check input
  if (!db.data.docs.some((doc) => doc.id === didStr))
    throw new Error("DID not found");
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  document.attachMethodRelationship(did.join(fragment), relationship);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await publishDid({ document });
  return { document: published };
}

export async function removeelationship(
  this: IotaClient,
  didStr: string,
  fragment: string,
  relationship: MethodRelationship,
) {
  const { didClient, db, publishDid } = this;

  // check input
  if (!db.data.docs.some((doc) => doc.id === didStr))
    throw new Error("DID not found");
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  document.detachMethodRelationship(did.join(fragment), relationship);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await publishDid({ document });
  return { document: published };
}
