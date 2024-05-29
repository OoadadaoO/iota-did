import {
  JwsAlgorithm,
  verifyEd25519,
  type IJwsVerifier,
  type Jwk,
  type MethodDigest,
} from "@iota/identity-wasm/node/index";

/**
 * A custom JWS Verifier capabale of verifying EdDSA signatures with curve Ed25519.
 */
export class Ed25519JwsVerifier implements IJwsVerifier {
  verify(
    alg: JwsAlgorithm,
    signingInput: Uint8Array,
    decodedSignature: Uint8Array,
    publicKey: Jwk,
  ) {
    switch (alg) {
      case JwsAlgorithm.EdDSA:
        // This verifies that the curve is Ed25519 so we don't need to check ourselves.
        return verifyEd25519(alg, signingInput, decodedSignature, publicKey);
      default:
        throw new Error(`unsupported jws algorithm ${alg}`);
    }
  }
}

/**
 * Converts a `MethodDigest` to a base64 encoded string.
 */
export function methodDigestToB64U(methodDigest: MethodDigest) {
  const arrayBuffer = methodDigest.pack().buffer;
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString("base64");
}

export function toDidIndex(
  accountIndex: number,
  addressIndex: number,
  didString: string,
) {
  return `${accountIndex}/${addressIndex}/${didString}`;
}

export function toKeyIdIndex(accountIndex: number, methodDigest: MethodDigest) {
  return `${accountIndex}/${methodDigestToB64U(methodDigest)}`;
}
