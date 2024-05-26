import {
  type IJwsVerifier,
  type Jwk,
  JwsAlgorithm,
  verifyEd25519,
} from "@iota/identity-wasm/node/index";

// A custom JWS Verifier capabale of verifying EdDSA signatures with curve Ed25519.
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
