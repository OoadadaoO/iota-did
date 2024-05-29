// Copyright 2020-2023 IOTA Stiftung
// SPDX-License-Identifier: Apache-2.0
import { IotaDID, type IotaDocument } from "@iota/identity-wasm/node/index";

import type { IotaClient } from "../";

export async function revokeVC(
  this: IotaClient,
  issuerDidStr: string,
  issuerRevokeFragment: string,
  issuerRevokeIndex: number | number[],
): Promise<{ document: IotaDocument }> {
  const { didClient, publishDid } = this;

  if (!issuerRevokeFragment.startsWith("#"))
    issuerRevokeFragment = `#${issuerRevokeFragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(issuerDidStr);
  const document = await didClient.resolveDid(did);

  document.revokeCredentials(did.join(issuerRevokeFragment), issuerRevokeIndex);
  const { document: published } = await publishDid({ document });

  return { document: published };
}

export async function unrevokeVC(
  this: IotaClient,
  issuerDidStr: string,
  issuerRevokeFragment: string,
  issuerRevokeIndex: number | number[],
): Promise<{ document: IotaDocument }> {
  const { didClient, publishDid } = this;

  if (!issuerRevokeFragment.startsWith("#"))
    issuerRevokeFragment = `#${issuerRevokeFragment}`;

  // Parse the DID and resolve the DID document.
  const did = IotaDID.parse(issuerDidStr);
  const document = await didClient.resolveDid(did);

  document.unrevokeCredentials(
    did.join(issuerRevokeFragment),
    issuerRevokeIndex,
  );
  const { document: published } = await publishDid({ document });

  return { document: published };
}
