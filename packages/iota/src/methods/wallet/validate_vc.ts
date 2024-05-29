import {
  EdDSAJwsVerifier,
  FailFast,
  JwtCredentialValidationOptions,
  JwtCredentialValidator,
  Resolver,
  type Credential,
  type Jwt,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../../DIDAddress";
import type { DIDWallet } from "../../DIDWallet";

export async function validateVC(
  this: DIDWallet | DIDAddress,
  credentialJwt: Jwt,
): Promise<{ credential: Credential }> {
  const didClient = await this.getDidClient();

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
