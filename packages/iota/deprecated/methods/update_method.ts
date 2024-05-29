// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import {
  IotaDID,
  JwkMemStore,
  JwsAlgorithm,
  MethodScope,
  Timestamp,
  MethodDigest,
  type IotaDocument,
} from "@iota/identity-wasm/node/index";

import type { IotaClient } from "../";
import type { JWK } from "../db";

/** Demonstrates how to update a DID document in an existing Alias Output. */
export async function insertMethod(
  this: IotaClient,
  didStr: string,
  fragment: string,
  methodScope?: MethodScope,
) {
  const { didClient, db, storage, publishDid, updateMethodKey } = this;

  // check input
  if (!db.data.docs.some((doc) => doc.id === didStr))
    throw new Error("DID not found");
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  // Insert a new Ed25519 (verification) method in the DID document.
  await document.generateMethod(
    storage,
    JwkMemStore.ed25519KeyType(),
    JwsAlgorithm.EdDSA,
    fragment,
    methodScope || MethodScope.VerificationMethod(),
  );

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await publishDid({ document });
  await updateMethodKey(published, fragment);
  return { document: published };
}

/** Demonstrates how to update a DID document in an existing Alias Output. */
export async function removeMethod(
  this: IotaClient,
  didStr: string,
  fragment: string,
  methodScope?: MethodScope,
) {
  const { didClient, db, storage, publishDid, updateMethodKey } = this;

  // check input
  if (!db.data.docs.some((doc) => doc.id === didStr))
    throw new Error("DID not found");
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  // Remove the origin (verification) method.
  const originalMethod = document.resolveMethod(fragment, methodScope);
  if (!originalMethod) throw new Error("OriginMethod not found");
  await document.purgeMethod(storage, originalMethod.id());

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await publishDid({ document });
  await updateMethodKey(published, fragment);
  return { document: published };
}

export async function updateMethodKey(
  this: IotaClient,
  document: IotaDocument,
  fragment: string,
  methodScope?: MethodScope,
) {
  const { db, storage } = this;

  // parse the method with the fragment
  const method = document.resolveMethod(fragment, methodScope);
  if (!method) {
    // *purge method
    await db.update((data) => {
      data.docs.forEach((doc) => {
        if (doc.id === document.id().toString()) {
          doc.methods = doc.methods.filter((m) => m.fragment !== fragment);
        }
      });
    });
  } else {
    // *insert method
    // get the key mapping from the storage
    const keyIds: Map<string, string> = (storage.keyIdStorage() as any)._keyIds;
    const keys: Map<string, JWK> = (storage.keyStorage() as any)._keys;

    const digestStr = String.fromCharCode(...new MethodDigest(method).pack());
    const keyId = keyIds.get(btoa(digestStr));
    const key = keys.get(keyId!);
    if (!keyId || !key) {
      throw new Error(`Key not found in the storage`);
    }

    await db.update((data) => {
      data.docs.forEach((doc) => {
        if (doc.id === document.id().toString()) {
          doc.methods.push({ fragment, jwk: key });
        }
      });
    });
  }
}
