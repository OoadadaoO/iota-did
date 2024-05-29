import {
  IotaDID,
  IotaDocument,
  MethodDigest,
} from "@iota/identity-wasm/node/index";
import { type AliasOutput, Utils, type IRent } from "@iota/sdk";

import type { DIDAddress } from "../../DIDAddress";

export async function createDid(
  this: DIDAddress,
): Promise<{ document: IotaDocument }> {
  const didClient = await this.getDidClient();
  const didDb = await this.getDidDb();

  // Get the Bech32 human-readable part (HRP) of the network.
  const networkHrp: string = await didClient.getNetworkHrp();

  // Create a new DID document with a placeholder DID.
  // The DID will be derived from the Alias Id of the Alias Output after publishing.
  const document = new IotaDocument(networkHrp);

  // Construct an Alias Output containing the DID document, with the wallet address
  // set as both the state controller and governor.
  const bech32Address = await this.getBech32Address();
  const address = Utils.parseBech32Address(bech32Address);
  const aliasOutput: AliasOutput = await didClient.newDidOutput(
    address,
    document,
  );

  const { document: published } = await this.publishDid({ aliasOutput });

  await didDb.update((data) => {
    data[this.toDidIndex(published.id().toString())] = {
      activate: true,
    };
  });

  return { document: published };
}

export async function deleteDid(this: DIDAddress, didString: string) {
  const didClient = await this.getDidClient();
  const secretManagerType = await this.getSecretManagerType();
  const didDb = await this.getDidDb();
  const keyIdDb = await this.getKeyIdDb();

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didString);
  const methods = (await didClient.resolveDid(did)).methods();

  // delete the DID document
  const bech32Address = await this.getBech32Address();
  const destinationAddress = Utils.parseBech32Address(bech32Address);
  await didClient.deleteDidOutput(secretManagerType, destinationAddress, did);

  // update database
  await didDb.update((data) => {
    delete data[this.toDidIndex(didString)];
  });
  await keyIdDb.update((data) => {
    methods.forEach((m) => {
      delete data[this.toKeyIdIndex(new MethodDigest(m))];
    });
  });
}

export async function deactivateDid(this: DIDAddress, didString: string) {
  const didClient = await this.getDidClient();
  const didDb = await this.getDidDb();

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didString);
  const document = await didClient.resolveDid(did);
  document.setMetadataDeactivated(true);

  // Publish the output.
  const { document: deactivated } = await this.publishDid({
    document,
  });

  // update database
  await didDb.update((data) => {
    data[this.toDidIndex(didString)] = {
      activate: false,
    };
  });

  return { document: deactivated };
}

export async function reactivateDid(this: DIDAddress, didString: string) {
  const didClient = await this.getDidClient();
  const didDb = await this.getDidDb();

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didString);
  const document = await didClient.resolveDid(did);
  document.setMetadataDeactivated(false);

  // Publish the output.
  const { document: reactivated } = await this.publishDid({
    document,
  });

  // update database
  await didDb.update((data) => {
    data[this.toDidIndex(didString)] = {
      activate: true,
    };
  });

  return { document: reactivated };
}

type PublishOut =
  | {
      document: IotaDocument;
      aliasOutput?: never;
    }
  | {
      document?: never;
      aliasOutput: AliasOutput;
    };

export async function publishDid(
  this: DIDAddress,
  out: PublishOut,
): Promise<{ document: IotaDocument }> {
  const client = await this.getClient();
  const didClient = await this.getDidClient();
  const secretManagerType = await this.getSecretManagerType();

  let aliasOutput: AliasOutput;
  if (out.document) {
    aliasOutput = await didClient.updateDidOutput(out.document);
  } else {
    aliasOutput = out.aliasOutput;
  }

  // Because the size of the DID document increased, we have to increase the allocated storage deposit.
  // This increases the deposit amount to the new minimum.
  const rentStructure: IRent = await didClient.getRentStructure();

  aliasOutput = await client.buildAliasOutput({
    ...aliasOutput,
    amount: Utils.computeStorageDeposit(aliasOutput, rentStructure),
    aliasId: aliasOutput.getAliasId(),
    unlockConditions: aliasOutput.getUnlockConditions(),
  });

  // Publish the output.
  const updated: IotaDocument = await didClient.publishDidOutput(
    secretManagerType,
    aliasOutput,
  );
  // const networkHrp = await didClient.getNetworkHrp();
  // // Publish block.
  // const [blockId, block] = await client.buildAndPostBlock(secretManagerType, {
  //   outputs: [aliasOutput],
  // });
  // console.log("block", block);
  // await client.retryUntilIncluded(blockId);
  // // Extract document with computed AliasId.
  // const documents = IotaDocument.unpackFromBlock(networkHrp, block);
  // if (documents.length < 1) {
  //   throw new Error("publishDidOutput: no DID document in transaction payload");
  // }
  // console.log("documents", documents);
  // console.log("updated", documents[0]);

  return { document: updated };
}
