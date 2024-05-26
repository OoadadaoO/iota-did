// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { IotaIdentityClient } from "@iota/identity-wasm/node";
import {
  SecretManager,
  Utils,
  type MnemonicSecretManager,
} from "@iota/sdk-wasm/node/lib/index";

import type { WalletDB } from "../db";

export async function createWallet(
  didClient: IotaIdentityClient,
  db: WalletDB,
): Promise<void> {
  // Get the Bech32 human-readable part (HRP) of the network.
  const networkHrp: string = await didClient.getNetworkHrp();

  // Generate a random mnemonic for our wallet.
  const mnemonicSecretManager: MnemonicSecretManager = {
    mnemonic: Utils.generateMnemonic(),
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

  // // Convert to Address
  // const address = Utils.parseBech32Address(walletAddressBech32);
  // const type = address.getType();

  await db.update((data) => {
    data.mnemonic = mnemonicSecretManager.mnemonic;
    data.bech32Address = walletAddressBech32;
    data.docs = [];
  });
}
