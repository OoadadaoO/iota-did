// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import { IotaDID } from "@iota/identity-wasm/node/index";

import type { IotaClient } from "../";

export async function deactivateDid(this: IotaClient, didStr: string) {
  const { didClient, publishDid } = this;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);
  document.setMetadataDeactivated(true);

  // Publish the output.
  const { document: deactivated } = await publishDid({
    document,
  });

  return { document: deactivated };
}

export async function reactivateDid(this: IotaClient, didStr: string) {
  const { didClient, publishDid } = this;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);
  document.setMetadataDeactivated(false);

  // Publish the output.
  const { document: reactivated } = await publishDid({
    document,
  });

  return { document: reactivated };
}
