// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import { IotaDID } from "@iota/identity-wasm/node/index";
import {
  type MnemonicSecretManager,
  Utils,
} from "@iota/sdk-wasm/node/lib/index";

import type { IotaClient } from "../";

export async function deleteDid(this: IotaClient, didStr: string) {
  const { didClient, db } = this;

  const secretManager: MnemonicSecretManager = {
    mnemonic: db.data.mnemonic,
  };

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);

  const destinationAddress = Utils.parseBech32Address(db.data.bech32Address);
  await didClient.deleteDidOutput(secretManager, destinationAddress, did);
  await db.update((data) => {
    data.docs = data.docs.filter((doc) => doc.id !== didStr);
  });
}
