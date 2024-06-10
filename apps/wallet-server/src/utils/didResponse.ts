import { getMethods, getServices } from "@did/iota";
import { IotaDocument } from "@iota/identity-wasm/node";

import { VcDb } from "../db";
import { Did, Document, Metadata, Vc } from "../routes/iota";

export async function didResponse(
  name: string,
  doc: IotaDocument,
): Promise<Did> {
  const db = await VcDb.getInstance(name);
  const vc: Vc[] = Object.values(db.data).filter(
    (vc) => vc.did === doc.id().toString(),
  );
  // .map((vc) => {
  //   const rawCredential = decodeJwt(vc.jwt);
  //   const credential: Credential = {
  //     "@context": (rawCredential.vc as any)["@context"],
  //     id: rawCredential.jti!,
  //     type: (rawCredential.vc as any).type,
  //     credentialSubject: (rawCredential.vc as any).credentialSubject,
  //     issuer: rawCredential.iss!,
  //     issuanceDate:
  //       new Date((rawCredential.iat || rawCredential.nbf)! * 1000)
  //         .toISOString()
  //         .split(".")[0] + "Z",
  //     expirationDate: rawCredential.exp
  //       ? new Date(rawCredential.exp * 1000).toISOString().split(".")[0] + "Z"
  //       : undefined,
  //     credentialStatus: (rawCredential.vc as any).credentialStatus,
  //   };
  //   return {
  //     ...vc,
  //     credential: credential,
  //   };
  // });
  return {
    did: doc.id().toString(),
    method: getMethods(doc),
    service: getServices(doc).map((s) => ({
      fragment: s.id().fragment()!,
      type: s.type()!,
      endpoint: s.serviceEndpoint().toString(),
      json: s.toJSON(),
    })),
    vc: vc,
    deactive: doc.metadataDeactivated() || false,
    json: doc.toJSON() as Document,
    metadata: doc.metadata().toJSON() as Metadata,
  };
}
