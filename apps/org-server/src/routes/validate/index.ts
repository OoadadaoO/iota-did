import express, { Request } from "express";
import { decodeJwt, decodeProtectedHeader } from "jose";

import { Jwt } from "@iota/identity-wasm/node";

import { DIDAddress } from "../../iota";
import type { TypedResponse } from "../types";
import type { PostValidateVcResponse, PostValidateVpResponse } from "./types";

const router = express.Router();

// Add middleware to the routes
router.post(
  "/vc",
  async (
    req: Request<
      never,
      never,
      {
        jwt: string;
      }
    >,
    res: TypedResponse<PostValidateVcResponse>,
  ) => {
    try {
      const { jwt } = req.body;
      const address = await DIDAddress.getInstance();
      try {
        const content = await address.validateVC(new Jwt(jwt));
        const vcPayload = decodeJwt(jwt.toString());
        const vcHeader = decodeProtectedHeader(jwt.toString());
        return res.status(200).json({
          data: {
            vc: {
              jwt,
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
        return res.status(200).json({
          error: {
            code: 400,
            message: "Invalid VC",
          },
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(200)
        .json({ error: { code: 500, message: "Internal server error" } });
    }
  },
);

router.post(
  "/vp",
  async (
    req: Request<
      never,
      never,
      {
        jwt: string;
      }
    >,
    res: TypedResponse<PostValidateVpResponse>,
  ) => {
    try {
      const { jwt } = req.body;
      const address = await DIDAddress.getInstance();
      try {
        const { credentials, rawCredentials } = await address.validateVP(
          new Jwt(jwt),
        );
        const vcPayload = decodeJwt(rawCredentials[0].toString());
        const vcHeader = decodeProtectedHeader(rawCredentials[0].toString());
        return res.status(200).json({
          data: {
            vc: {
              jwt: rawCredentials[0].toJSON(),
              content: JSON.stringify(credentials[0]),
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
        return res.status(200).json({
          error: {
            code: 400,
            message: "Invalid VP",
          },
        });
      }
    } catch (error) {
      console.error(error);
      return res
        .status(200)
        .json({ error: { code: 500, message: "Internal server error" } });
    }
  },
);

export * from "./types";
export default router;
