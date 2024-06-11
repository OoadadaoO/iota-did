import express, { Request } from "express";
import { decodeJwt, decodeProtectedHeader } from "jose";

import {
  ICredential,
  IotaDID,
  RevocationBitmap,
} from "@iota/identity-wasm/node";

import { DIDAddress } from "../../iota";
import type { TypedResponse } from "../types";
import type { PostVcResponse } from "./types";

const router = express.Router();

// Add middleware to the routes
router.post(
  "/",
  async (
    req: Request<
      never,
      never,
      {
        issuer: {
          did: string;
          frag: string;
        };
        credData: ICredential;
        revoke: {
          frag: string;
          index: string;
        };
      }
    >,
    res: TypedResponse<PostVcResponse>,
  ) => {
    try {
      const { issuer, credData, revoke } = req.body;
      const address = await DIDAddress.getInstance();
      const vc = await address.createVC(issuer.did, issuer.frag, {
        ...credData,
        credentialStatus: {
          id: IotaDID.parse(issuer.did).join(`#${revoke.frag}`).toString(),
          type: RevocationBitmap.type(),
          revocationBitmapIndex: revoke.index.toString(),
        },
      });
      const content = await address.validateVC(vc);
      const vcPayload = decodeJwt(vc.toString());
      const vcHeader = decodeProtectedHeader(vc.toString());
      res.status(200).json({
        data: {
          vc: {
            jwt: vc.toString(),
            content: JSON.stringify(content.credential),
            did: vcPayload.sub!,
            issuerDid: vcPayload.iss!,
            issuerFragment: vcHeader.kid!.split("#")[1],
            revokeFragment: (vcPayload.vc as any).credentialStatus.id.split(
              "#",
            )[1],
            revokeIndex: (vcPayload.vc as any).credentialStatus
              .revocationBitmapIndex,
          },
        },
      });
    } catch (error) {
      console.error(error);
      res
        .status(200)
        .json({ error: { code: 500, message: "Internal server error" } });
    }
  },
);

export * from "./types";
export default router;
