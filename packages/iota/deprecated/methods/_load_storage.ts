import type { IotaIdentityClient } from "@iota/identity-wasm/node";
import {
  IotaDID,
  Jwk,
  JwkType,
  MethodDigest,
  type Storage,
  type IJwkOkp,
} from "@iota/identity-wasm/node/index";

import type { WalletDB } from "../db";

export async function loadStorage(
  didClient: IotaIdentityClient,
  db: WalletDB,
  storage: Storage,
): Promise<void> {
  for (const doc of db.data.docs) {
    const did = IotaDID.parse(doc.id);
    const document = await didClient.resolveDid(did);
    for (const method of doc.methods) {
      const verificationMethod = document.resolveMethod(method.fragment);
      if (!verificationMethod) {
        console.log(`Method ${method.fragment} not found in the document`);
        continue;
      }

      // check method with database
      const publicJwk = verificationMethod.data().tryPublicKeyJwk();
      if (publicJwk.kty() !== JwkType.Okp) {
        console.log(
          `Method ${method.fragment} with invalid jwk type ${publicJwk.kty()}`,
        );
        continue;
      }
      if (
        publicJwk.kty() !== method.jwk.kty ||
        publicJwk.alg() !== method.jwk.alg ||
        publicJwk.paramsOkp()?.crv !== method.jwk.crv ||
        publicJwk.paramsOkp()?.x !== method.jwk.x
      ) {
        console.log(
          `Method ${method.fragment} with jwk different from database`,
        );
        continue;
      }

      const privateJwk = new Jwk(method.jwk as IJwkOkp);
      const keyId = await storage.keyStorage().insert(privateJwk);
      await storage
        .keyIdStorage()
        .insertKeyId(new MethodDigest(verificationMethod), keyId);
    }
  }
}
