import {
  Credential,
  JwsSignatureOptions,
  type IJwsSignatureOptions,
  type ICredential,
  type Jwt,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../..";

/**
 * @example
 *
 * Create a `UniversityDegree` credential with RevocationBitmap for Alice.
 *
 * ```ts
 * const credentialData = {
 *   id: "https://example.edu/credentials/3732",
 *   type: "UniversityDegreeCredential",
 *   credentialStatus: {
 *     id: didStr.join("#like-revoked"),
 *     type: RevocationBitmap.type(),
 *     revocationBitmapIndex: "CREDENTIAL_INDEX",
 *   },
 *   issuer: didStr,
 *   credentialSubject: {
 *     id: "subjectDid",
 *     name: "Alice",
 *     degreeName: "Bachelor of Science and Arts",
 *     degreeType: "BachelorDegree",
 *     GPA: "4.0",
 *   },
 * };
 * const customClaims = { exp: Math.trunc(Date.now() / 1000 + 60 * 10) };
 * ```
 */
export async function createVC(
  this: DIDAddress,
  issuerDidString: string,
  issuerFragment: string,
  credentialData: ICredential,
  jwsSignatureOptions?: IJwsSignatureOptions,
  customClaims?: Record<string, any>,
): Promise<Jwt> {
  const storage = await this.getStorage();

  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(issuerDidString);

  // Create an unsigned `UniversityDegree` credential for Alice.
  // The issuer also chooses a unique `RevocationBitmap` index to be able to revoke it later.
  const unsignedVc = new Credential(credentialData);

  // Create signed JWT credential.
  const credentialJwt = await document.createCredentialJwt(
    storage,
    issuerFragment,
    unsignedVc,
    new JwsSignatureOptions(jwsSignatureOptions),
    customClaims,
  );

  return credentialJwt;
}
