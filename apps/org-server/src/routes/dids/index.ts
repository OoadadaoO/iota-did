import express from "express";

import { getClassfiedMethods, getServices } from "@did/iota";

import { DIDWallet } from "../../iota";
import type { TypedResponse } from "../types";
import type { GetDIDsResponse } from "./types";

const router = express.Router();

// Add middleware to the routes
router.get(
  "/",
  async (req: express.Request, res: TypedResponse<GetDIDsResponse>) => {
    const { address } = await DIDWallet.getInstance();
    try {
      const dids = (await address.getDids()).map((doc) => ({
        did: doc.id().toString(),
        method: getClassfiedMethods(doc, true),
        service: getServices(doc).map((s) => ({
          fragment: s.id().fragment()!,
          type: s.type()!,
        })),
      }));
      res.status(200).json({ data: { dids } });
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
