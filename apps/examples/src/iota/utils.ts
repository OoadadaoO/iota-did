import type { PathLike } from "fs";

import { IotaClient } from "@did/iota";
import {
  MethodRelationship,
  MethodScope,
  type IotaDocument,
} from "@iota/identity-wasm/node";

const API_ENDPOINT = "http://140.112.18.206:14265";
const FAUCET_ENDPOINT = "http://140.112.18.206:8091/api/enqueue";

export async function initializeWallet(walletPath: PathLike) {
  // initialize client and wait for it to load
  const client = await IotaClient.build(
    {
      primaryNode: API_ENDPOINT,
    },
    {
      dbPath: walletPath,
    },
  );

  let ret: { document: IotaDocument };

  // Request funds
  await client.requestFunds(FAUCET_ENDPOINT);

  // wait for funds to be received
  let balance = 0n;
  while (balance === 0n) {
    // Get the balance
    balance = (await client.getBalance()) || 0n;
    if (balance > 0n) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(`Balance: ${balance} tokens\n`);

  // Create a DID
  ret = await client.createDid();
  console.log(`New DID Document: ${JSON.stringify(ret.document, null, 2)}\n`);

  // read the first DID from the db
  const did = client.db.data.docs[0].id;

  // Resolve a DID Document
  ret = await client.resolveDid(did);
  console.log(
    `Resolved DID Document: ${JSON.stringify(ret.document, null, 2)}\n`,
  );

  // Deactivate & Reactivate a DID Document
  ret = await client.deactivateDid(did);
  console.log(`Metadata deactivated: ${ret.document.metadataDeactivated()}\n`);
  ret = await client.reactivateDid(did);
  console.log(`Metadata deactivated: ${ret.document.metadataDeactivated()}\n`);

  // // Delete a DID Document
  // await client.deleteDid(did);

  // Update Did Document
  // Insert/Remove a new verification method (#fragment)
  ret = await client.insertMethod(
    did,
    "#key-0",
    MethodScope.VerificationMethod(),
  );
  console.log(JSON.stringify(ret.document, null, 2));

  // Insert/Remove a new verification method
  ret = await client.insertMethod(
    did,
    "#key-1",
    MethodScope.VerificationMethod(),
  );
  console.log(JSON.stringify(ret.document, null, 2));

  // Insert/Remove a reference of verification method to a relationship
  ret = await client.insertRelationship(
    did,
    "#key-1",
    MethodRelationship.Authentication,
  );
  console.log(JSON.stringify(ret.document, null, 2));

  // Insert/Remove a new service
  ret = await client.insertService(did, "#linked-domain", {
    type: "LinkedDomains",
    serviceEndpoint: "https://example.com/",
  });
  console.log(JSON.stringify(ret.document, null, 2));

  // Add RevocationBitmap2022
  ret = await client.insertRevokeService(did, "#revocation");
  console.log(JSON.stringify(ret.document, null, 2));
}
