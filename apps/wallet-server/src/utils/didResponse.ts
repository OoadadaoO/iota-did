import { getMethods, getServices } from "@did/iota";
import { IotaDocument } from "@iota/identity-wasm/node";

export function didResponse(doc: IotaDocument) {
  return {
    did: doc.id().toString(),
    method: getMethods(doc),
    service: getServices(doc).map((s) => ({
      fragment: s.id().fragment()!,
      type: s.type()!,
      endpoint: s.serviceEndpoint().toString(),
      text: s.toString(),
    })),
    deactive: doc.metadataDeactivated() || false,
    document: doc.toString(),
  };
}
