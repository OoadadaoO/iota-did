import crypto from "crypto";

import "@iota/identity-wasm/node/index";
import {
  Jwk,
  JwkType,
  JwsAlgorithm,
  type IJwkOkp,
} from "@iota/identity-wasm/node/index";
import type { SecretManager } from "@iota/sdk";

export async function buildJwk(
  seed: Buffer,
  secretManager: SecretManager,
  accountIndex: number,
) {
  const addressIndex = Buffer.from(
    seed.filter((_, i) => i % 3 === 1),
  ).readUInt32BE(0);
  const { publicKey } = await secretManager.signEd25519("0x", {
    account: accountIndex,
    change: 1,
    addressIndex,
  });

  const publicKeyB64U = hexToB64U(publicKey, "0x");

  const jwkParams: IJwkOkp = {
    kty: JwkType.Okp,
    alg: JwsAlgorithm.EdDSA,
    crv: "Ed25519",
    x: publicKeyB64U,
  };

  const kid = createThumbprint(jwkParams);
  jwkParams.kid = kid;
  return { jwk: new Jwk(jwkParams), kid };
}

/**
 * Converts a hex string to a base64url encoded string.
 */
export function hexToB64U(hexString: string, prefix: string = "") {
  if (!!prefix && !hexString.startsWith(prefix)) {
    throw new Error(`Invalid ${prefix}-prefix hex string`);
  }
  return Buffer.from(hexString.slice(prefix.length), "hex").toString(
    "base64url",
  );
}

/**
 * JSON Web Key (JWK) Thumbprint [[RFC7638]](https://www.rfc-editor.org/rfc/rfc7638)
 */
export function createThumbprint(jwkOkp: IJwkOkp): string {
  if (!jwkOkp.alg) throw new Error("Jwk missing alg");
  if (!jwkOkp.crv) throw new Error("Jwk missing crv");
  if (!jwkOkp.kty) throw new Error("Jwk missing kty");
  if (!jwkOkp.x) throw new Error("Jwk missing x");
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        alg: jwkOkp.alg,
        crv: jwkOkp.crv,
        kty: jwkOkp.kty,
        x: jwkOkp.x,
      }),
    )
    .digest("base64url");
}
