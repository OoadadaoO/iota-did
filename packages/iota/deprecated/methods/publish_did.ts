// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { IotaDocument } from "@iota/identity-wasm/node/index";
import {
  type AliasOutput,
  type IRent,
  type MnemonicSecretManager,
  Utils,
} from "@iota/sdk-wasm/node/lib/index";

import type { IotaClient } from "../";

type Out =
  | {
      document: IotaDocument;
      aliasOutput?: never;
    }
  | {
      document?: never;
      aliasOutput: AliasOutput;
    };

export async function publishDid(
  this: IotaClient,
  out: Out,
): Promise<{ document: IotaDocument }> {
  const { client, didClient, db } = this;

  // Generate a random mnemonic for our wallet.
  const secretManager: MnemonicSecretManager = {
    mnemonic: db.data.mnemonic,
  };

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
    secretManager,
    aliasOutput,
  );

  return { document: updated };
}
