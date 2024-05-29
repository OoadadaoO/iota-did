import {
  IotaDID,
  JwkMemStore,
  JwsAlgorithm,
  MethodScope,
  Timestamp,
  MethodDigest,
  VerificationMethod,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../../DIDAddress";

export async function insertMethod(
  this: DIDAddress,
  didString: string,
  methodScope?: MethodScope,
) {
  const storage = await this.getStorage();

  // Resolve the DID document.
  const did = IotaDID.parse(didString);
  const { document } = await this.resolveDid(didString);

  // Insert a new Ed25519 (verification) method in the DID document.
  // await document.generateMethod(
  //   storage,
  //   JwkMemStore.ed25519KeyType(),
  //   JwsAlgorithm.EdDSA,
  //   fragment,
  //   methodScope || MethodScope.VerificationMethod(),
  // );
  const output = await storage
    .keyStorage()
    .generate(JwkMemStore.ed25519KeyType(), JwsAlgorithm.EdDSA);
  const fragment = output.jwk().kid()!;
  const newMethod = VerificationMethod.newFromJwk(did, output.jwk(), fragment);
  await storage
    .keyIdStorage()
    .insertKeyId(new MethodDigest(newMethod), output.keyId());
  document.insertMethod(
    newMethod,
    methodScope || MethodScope.VerificationMethod(),
  );
  document.setMetadataUpdated(Timestamp.nowUTC());

  return {
    document: await this.publishDid({ document }),
    method: document.resolveMethod(fragment)!,
  };
}

/** Demonstrates how to update a DID document in an existing Alias Output. */
export async function removeMethod(
  this: DIDAddress,
  didString: string,
  fragment: string,
  methodScope?: MethodScope,
) {
  const storage = await this.getStorage();

  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  // Resolve the DID document.
  const { document } = await this.resolveDid(didString);

  // Remove the origin (verification) method.
  const originalMethod = document.resolveMethod(fragment, methodScope);
  if (!originalMethod) throw new Error("OriginMethod not found");
  // await document.purgeMethod(storage, originalMethod.id());
  await storage.keyIdStorage().deleteKeyId(new MethodDigest(originalMethod));
  document.removeMethod(originalMethod.id());
  document.setMetadataUpdated(Timestamp.nowUTC());

  return await this.publishDid({ document });
}
