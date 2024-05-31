import {
  IotaDocument,
  MethodDigest,
  MethodScope,
} from "@iota/identity-wasm/node/index";
import { type AliasOutput, Utils, type IRent } from "@iota/sdk";

import type { DIDAddress } from "../../DIDAddress";

export async function getDids(this: DIDAddress): Promise<IotaDocument[]> {
  const client = await this.getClient();

  const bech32Hrp = await this.getBech32Hrp();
  const outputsIds = await client.aliasOutputIds([
    { sender: await this.getBech32Address() },
  ]);
  const outputs = await client.getOutputsIgnoreErrors(outputsIds.items);
  const dids = outputs.map(
    (output) => `did:iota:${bech32Hrp}:${(output.output as any).aliasId}`,
  );

  const documents: IotaDocument[] = [];
  for (const did of dids) {
    try {
      documents.push(await this.resolveDid(did));
    } catch (error) {
      // ignore
    }
  }

  return documents;
}

export async function createDid(this: DIDAddress): Promise<IotaDocument> {
  const didClient = await this.getDidClient();

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

  const published = await this.publishDid({ aliasOutput });

  // Insert a verification method
  const updated = await this.insertMethod(
    published.id().toString(),
    MethodScope.VerificationMethod(),
  );

  return updated;
}

export async function deleteDid(this: DIDAddress, didString: string) {
  const didClient = await this.getDidClient();
  const secretManagerType = await this.getSecretManagerType();
  const keyIdDb = await this.getKeyIdDb();

  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(didString);
  const did = document.id();
  const methods = document.methods();

  // delete the DID document
  const bech32Address = await this.getBech32Address();
  const destinationAddress = Utils.parseBech32Address(bech32Address);
  await didClient.deleteDidOutput(secretManagerType, destinationAddress, did);

  // update database
  await keyIdDb.update((data) => {
    methods.forEach((m) => {
      delete data[this.toKeyIdIndex(new MethodDigest(m))];
    });
  });
}

export async function deactivateDid(this: DIDAddress, didString: string) {
  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(didString);
  document.setMetadataDeactivated(true);

  // Publish the output.
  const deactivated = await this.publishDid({
    document,
  });

  return deactivated;
}

export async function reactivateDid(this: DIDAddress, didString: string) {
  // Parse the DID and resolve the DID document.
  const document = await this.resolveDid(didString);
  document.setMetadataDeactivated(false);

  // Publish the output.
  const reactivated = await this.publishDid({
    document,
  });

  return reactivated;
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
): Promise<IotaDocument> {
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

  return updated;
}
