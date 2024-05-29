import {
  Credential,
  IotaDID,
  JwsSignatureOptions,
  type IJwsSignatureOptions,
  type ICredential,
  type Jwt,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../..";

export async function createVC(
  this: DIDAddress,
  issuerDidStr: string,
  issuerFragment: string,
  credentialData: ICredential,
  jwsSignatureOptions?: IJwsSignatureOptions,
  customClaims?: Record<string, any>,
): Promise<{ vc: Jwt }> {
  const didClient = await this.getDidClient();
  const storage = await this.getStorage();

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(issuerDidStr);
  const document = await didClient.resolveDid(did);

  // // Some example credential data
  // // Create a `UniversityDegree` credential with RevocationBitmap for Alice.
  // const credential = {
  //   id: "https://example.edu/credentials/3732",
  //   type: "UniversityDegreeCredential",
  //   credentialStatus: {
  //     id: didStr.join("#like-revoked"),
  //     type: RevocationBitmap.type(),
  //     revocationBitmapIndex: "CREDENTIAL_INDEX",
  //   },
  //   issuer: didStr,
  //   credentialSubject: {
  //     id: "subjectDid",
  //     name: "Alice",
  //     degreeName: "Bachelor of Science and Arts",
  //     degreeType: "BachelorDegree",
  //     GPA: "4.0",
  //   },
  // };

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

  return { vc: credentialJwt };
}
