// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import { IotaDocument } from "@iota/identity-wasm/node/index";
import {
  type AliasOutput,
  type MnemonicSecretManager,
  SecretManager,
  Utils,
} from "@iota/sdk-wasm/node/lib/index";

import type { IotaClient } from "../";

export async function createDid(
  this: IotaClient,
): Promise<{ document: IotaDocument }> {
  const { didClient, db, publishDid } = this;

  // Get the Bech32 human-readable part (HRP) of the network.
  const networkHrp: string = await didClient.getNetworkHrp();

  const mnemonicSecretManager: MnemonicSecretManager = {
    mnemonic: this.db.data.mnemonic,
  };

  // Generate a random mnemonic for our wallet.
  const secretManager: SecretManager = new SecretManager(mnemonicSecretManager);

  const walletAddressBech32 = (
    await secretManager.generateEd25519Addresses({
      accountIndex: 0,
      range: {
        start: 0,
        end: 1,
      },
      bech32Hrp: networkHrp,
    })
  )[0];

  // Create a new DID document with a placeholder DID.
  // The DID will be derived from the Alias Id of the Alias Output after publishing.
  const document = new IotaDocument(networkHrp);

  // Construct an Alias Output containing the DID document, with the wallet address
  // set as both the state controller and governor.
  const address = Utils.parseBech32Address(walletAddressBech32);
  const aliasOutput: AliasOutput = await didClient.newDidOutput(
    address,
    document,
  );

  const { document: published } = await publishDid({ aliasOutput });

  await db.update((data) => {
    data.docs.push({
      id: published.id().toString(),
      methods: [],
    });
  });

  return { document: published };
}
