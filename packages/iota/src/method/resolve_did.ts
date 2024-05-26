// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import type { IotaClient } from "..";

import { IotaDID } from "@iota/identity-wasm/node/index";

export async function resolveDid(this: IotaClient, didStr: string) {
  const { didClient } = this;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(didStr);
  const document = await didClient.resolveDid(did);

  return { document };
}
