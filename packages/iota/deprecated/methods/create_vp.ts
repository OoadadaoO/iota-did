// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import {
  IotaDID,
  JwsSignatureOptions,
  JwtPresentationOptions,
  Presentation,
  type IJwsSignatureOptions,
  type IJwtPresentationOptions,
  type IPresentation,
  type Jwt,
} from "@iota/identity-wasm/node/index";

import type { IotaClient } from "../";

export type Subject = Record<string, string>;

export async function createVP(
  this: IotaClient,
  holderDidStr: string,
  holderFragment: string,
  presentationData: IPresentation,
  jwsSignatureOptions?: IJwsSignatureOptions,
  jwtPresentationOptions?: IJwtPresentationOptions,
): Promise<{ vp: Jwt }> {
  const { didClient, storage } = this;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(holderDidStr);
  const document = await didClient.resolveDid(did);

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

  return { vp: presentationJwt };
}
