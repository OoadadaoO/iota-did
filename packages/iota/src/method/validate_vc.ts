// // Copyright 2020-2023 IOTA Stiftung
// // SPDX-License-Identifier: Apache-2.0
// import type { IotaClient } from "..";
// import {
//   FailFast,
//   IotaDID,
//   JwtCredentialValidationOptions,
//   JwtCredentialValidator,
//   type Credential,
//   type Jwt,
// } from "@iota/identity-wasm/node/index";
// import { Ed25519JwsVerifier } from "../util";
// export type Subject = Record<string, string>;
// export async function validateVC(
//   this: IotaClient,
//   issuerDidStr: string,
//   credentialJwt: Jwt,
// ): Promise<{ credential: Credential }> {
//   const { didClient } = this;
//   // Parse the DID and resolve the DID document.
//   const did = IotaDID.parse(issuerDidStr);
//   const document = await didClient.resolveDid(did);
//   // Validate the credential using the issuer's DID Document.
//   const jwtCredentialValidator = new JwtCredentialValidator(
//     new Ed25519JwsVerifier(),
//   );
//   const res = jwtCredentialValidator.validate(
//     credentialJwt,
//     document,
//     new JwtCredentialValidationOptions(),
//     FailFast.FirstError,
//   );
//   return { credential: res.credential() };
// }
// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { IotaClient } from "..";

import {
  EdDSAJwsVerifier,
  FailFast,
  JwtCredentialValidationOptions,
  JwtCredentialValidator,
  Resolver,
  type Credential,
  type Jwt,
} from "@iota/identity-wasm/node/index";

export type Subject = Record<string, string>;

export async function validateVC(
  this: IotaClient,
  credentialJwt: Jwt,
): Promise<{ credential: Credential }> {
  const { didClient } = this;

  // Parse the DID and resolve the DID document.
  const resolver = new Resolver({
    client: didClient,
  });
  const did = JwtCredentialValidator.extractIssuerFromJwt(credentialJwt);
  const resolvedHolder = await resolver.resolve(did.toString());

  // Validate the credential using the issuer's DID Document.
  const jwtCredentialValidator = new JwtCredentialValidator(
    new EdDSAJwsVerifier(),
  );
  const res = jwtCredentialValidator.validate(
    credentialJwt,
    resolvedHolder,
    new JwtCredentialValidationOptions(),
    FailFast.FirstError,
  );

  return { credential: res.credential() };
}
