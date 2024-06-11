import express, { Request } from "express";

import { DIDAddress } from "../../iota";
import type { TypedResponse } from "../types";
import type { RevokeVcResponse } from "./types";

const router = express.Router();

// Add middleware to the routes
router.post(
  "/",
  async (
    req: Request<
      never,
      never,
      {
        type: "revoke" | "unrevoke";
        did: string;
        frag: string;
        index: string;
      }
    >,
    res: TypedResponse<RevokeVcResponse>,
  ) => {
    try {
      const { type, did, frag, index } = req.body;
      const address = await DIDAddress.getInstance();
      if (type === "revoke") {
        await address.revokeVC(did, frag, parseInt(index));
      } else if (type === "unrevoke") {
        await address.unrevokeVC(did, frag, parseInt(index));
      } else {
        return res
          .status(200)
          .json({ error: { code: 400, message: "Invalid type" } });
      }

      return res.status(200).json({ data: {} });
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
