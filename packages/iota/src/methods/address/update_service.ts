import {
  type IService,
  Service,
  IotaDID,
  Timestamp,
  RevocationBitmap,
} from "@iota/identity-wasm/node/index";

import type { DIDAddress } from "../..";

export async function insertService(
  this: DIDAddress,
  didStr: string,
  fragment: string,
  serviceOptions?: Omit<IService, "id">,
) {
  const didClient = await this.getDidClient();

  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  // Update the DID document with the new service.
  if (!serviceOptions) throw new Error("Service options not provided");
  const service: Service = new Service({
    ...serviceOptions,
    id: did.join(fragment),
  });
  document.insertService(service);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await this.publishDid({ document });
  return { document: published };
}

export async function removeService(
  this: DIDAddress,
  didStr: string,
  fragment: string,
) {
  const didClient = await this.getDidClient();

  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  document.removeService(did.join(fragment));

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await this.publishDid({ document });
  return { document: published };
}

export async function insertRevokeService(
  this: DIDAddress,
  didStr: string,
  fragment: string,
) {
  const didClient = await this.getDidClient();

  // check input
  if (!fragment.startsWith("#")) fragment = `#${fragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  // Update the DID document with the new service.
  // Create a new empty revocation bitmap. No credential is revoked yet.
  const revocationBitmap = new RevocationBitmap();
  const REVOCATION_SERVICE_ID = did.join(fragment);

  // Add the revocation bitmap to the DID Document of the issuer as a service.
  const serviceId = REVOCATION_SERVICE_ID;
  const revocationService: Service = revocationBitmap.toService(serviceId);
  document.insertService(revocationService);

  document.setMetadataUpdated(Timestamp.nowUTC());
  const { document: published } = await this.publishDid({ document });
  return { document: published };
}
