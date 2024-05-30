import {
  JwsSignatureOptions,
  JwtPresentationOptions,
  Presentation,
  type IJwsSignatureOptions,
  type IJwtPresentationOptions,
  type IPresentation,
  type Jwt,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../..";

/**
 * @example
 *
 * ```ts
 * const presentationData = {
 *   holder: holderDidStr,
 *   verifiableCredential: [credentialJwt],
 * };
 * const jwsSignatureOptions = { nonce };
 * const jwtPresentationOptions = { expirationDate: expires };
 * ```
 */
export async function createVP(
  this: DIDAddress,
  holderDidString: string,
  holderFragment: string,
  presentationData: IPresentation,
  jwsSignatureOptions?: IJwsSignatureOptions,
  jwtPresentationOptions?: IJwtPresentationOptions,
): Promise<Jwt> {
  const storage = await this.getStorage();

  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(holderDidString);

  // // Some example presentation data
  // const presentationData = {
  //   holder: holderDidStr,
  //   verifiableCredential: [credentialJwt],
  // };
  // const jwsSignatureOptions = { nonce }
  // const jwtPresentationOptions = { expirationDate: expires }

  // Create a Verifiable Presentation from the Credential
  const unsignedVp = new Presentation(presentationData);

  // Create a JWT verifiable presentation using the holder's verification method
  // and include the requested challenge and expiry timestamp.
  const presentationJwt = await document.createPresentationJwt(
    storage,
    holderFragment,
    unsignedVp,
    new JwsSignatureOptions(jwsSignatureOptions),
    new JwtPresentationOptions(jwtPresentationOptions),
  );

  return presentationJwt;
}
