// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { IotaClient } from "..";

import {
  EdDSAJwsVerifier,
  FailFast,
  JwsVerificationOptions,
  JwtCredentialValidationOptions,
  JwtCredentialValidator,
  JwtPresentationValidationOptions,
  JwtPresentationValidator,
  Resolver,
  SubjectHolderRelationship,
  type CoreDID,
  type Credential,
  type IJwsVerificationOptions,
  type Jwt,
  type Presentation,
} from "@iota/identity-wasm/node/index";

export type Subject = Record<string, string>;

export async function validateVP(
  this: IotaClient,
  presentationJwt: Jwt,
  jwsVerificationOptions?: IJwsVerificationOptions,
): Promise<{
  presentation: Presentation;
  credentials: Credential[];
}> {
  const { didClient } = this;

  // Parse the DID and resolve the DID document.

  const jwtPresentationValidationOptions = new JwtPresentationValidationOptions(
    {
      presentationVerifierOptions: new JwsVerificationOptions(
        jwsVerificationOptions,
      ),
    },
  );

  // Resolve the presentation holder.
  const resolver = new Resolver({
    client: didClient,
  });
  const presentationHolderDID: CoreDID =
    JwtPresentationValidator.extractHolder(presentationJwt);
  const resolvedHolder = await resolver.resolve(
    presentationHolderDID.toString(),
  );

  // Validate presentation. Note that this doesn't validate the included credentials.
  const presentationValidator = new JwtPresentationValidator(
    new EdDSAJwsVerifier(),
  );
  const decodedPresentation = presentationValidator.validate(
    presentationJwt,
    resolvedHolder,
    jwtPresentationValidationOptions,
  );

  // Validate credentials in the presentation.
  const credentialValidator = new JwtCredentialValidator(
    new EdDSAJwsVerifier(),
  );
  const validationOptions = new JwtCredentialValidationOptions({
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
      validationOptions,
      FailFast.FirstError,
    );
    decodeCredentials.push(res.credential());
  }

  return {
    presentation: decodedPresentation.presentation(),
    credentials: decodeCredentials,
  };
}
