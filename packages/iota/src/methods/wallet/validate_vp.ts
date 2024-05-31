// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import {
  EdDSAJwsVerifier,
  FailFast,
  JwtCredentialValidationOptions,
  JwtCredentialValidator,
  JwtPresentationValidationOptions,
  JwtPresentationValidator,
  Resolver,
  SubjectHolderRelationship,
  type CoreDID,
  type Credential,
  type IJwtPresentationValidationOptions,
  type IJwtCredentialValidationOptions,
  type Jwt,
  type Presentation,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../../DIDAddress";
import type { DIDWallet } from "../../DIDWallet";

export async function validateVP(
  this: DIDWallet | DIDAddress,
  presentationJwt: Jwt,
  jwtPresentationVerificationOptions?: IJwtPresentationValidationOptions,
  jwtCredentialValidationOptions?: IJwtCredentialValidationOptions,
): Promise<{
  presentation: Presentation;
  credentials: Credential[];
  rawCredentials: Jwt[];
}> {
  const didClient = await this.getDidClient();

  // Resolve the presentation holder.
  const resolver = new Resolver({
    client: didClient,
  });
  const presentationHolderDID: CoreDID =
    JwtPresentationValidator.extractHolder(presentationJwt);

  // Validate presentation. Note that this doesn't validate the included credentials.
  const presentationValidator = new JwtPresentationValidator(
    new EdDSAJwsVerifier(),
  );
  const resolvedHolder = await resolver.resolve(
    presentationHolderDID.toString(),
  );
  const presentationValidationOptions = new JwtPresentationValidationOptions(
    jwtPresentationVerificationOptions,
  );
  const decodedPresentation = presentationValidator.validate(
    presentationJwt,
    resolvedHolder,
    presentationValidationOptions,
  );

  // Validate credentials in the presentation.
  const credentialValidator = new JwtCredentialValidator(
    new EdDSAJwsVerifier(),
  );
  const credentialValidationOptions = new JwtCredentialValidationOptions({
    ...jwtCredentialValidationOptions,
    subjectHolderRelationship: [
      presentationHolderDID.toString(),
      SubjectHolderRelationship.AlwaysSubject, // holder is always the subject
    ],
  });

  // Extract the JWT credentials from the presentation.
  const jwtCredentials: Jwt[] = decodedPresentation
    .presentation()
    .verifiableCredential()
    .map((credential) => {
      const jwt = credential.tryIntoJwt();
      if (!jwt) {
        throw new Error("expected a JWT credential");
      } else {
        return jwt;
      }
    });

  // Concurrently resolve the issuers' documents.
  const issuers: string[] = [];
  for (const jwtCredential of jwtCredentials) {
    const issuer = JwtCredentialValidator.extractIssuerFromJwt(jwtCredential);
    issuers.push(issuer.toString());
  }
  const resolvedIssuers = await resolver.resolveMultiple(issuers);

  // Validate the credentials in the presentation.
  const decodeCredentials: Credential[] = [];
  for (let i = 0; i < jwtCredentials.length; i++) {
    const res = credentialValidator.validate(
      jwtCredentials[i],
      resolvedIssuers[i],
      credentialValidationOptions,
      FailFast.FirstError,
    );
    decodeCredentials.push(res.credential());
  }

  return {
    presentation: decodedPresentation.presentation(),
    credentials: decodeCredentials,
    rawCredentials: jwtCredentials,
  };
}
