import express from "express";

import {
  deleteDid,
  deleteMethod,
  deleteService,
  getAccounts,
  getBalance,
  getDIDs,
  getFundsFromFaucet,
  getWallets,
  patchDid,
  patchMethod,
  postAccounts,
  postDIDs,
  postMethods,
  postPassword,
  postServices,
  postWallets,
} from "./controllers";
import { passwordAuth } from "./middlewares";

const router = express.Router();

router.get("/wallets", getWallets);
router.post("/wallets", postWallets);

router.post("/wallets/:name/password", passwordAuth, postPassword);

router.get("/wallets/:name/accounts", passwordAuth, getAccounts);
router.post("/wallets/:name/accounts", passwordAuth, postAccounts);

router.get("/wallets/:name/accounts/:index/balance", passwordAuth, getBalance);
router.get(
  "/wallets/:name/accounts/:index/faucet",
  passwordAuth,
  getFundsFromFaucet,
);

router.get("/wallets/:name/accounts/:index/dids", passwordAuth, getDIDs);
router.post("/wallets/:name/accounts/:index/dids", passwordAuth, postDIDs);
router.patch("/wallets/:name/accounts/:index/dids/:id", passwordAuth, patchDid);
router.delete(
  "/wallets/:name/accounts/:index/dids/:id",
  passwordAuth,
  deleteDid,
);
router.post(
  "/wallets/:name/accounts/:index/dids/:id/methods",
  passwordAuth,
  postMethods,
);
router.delete(
  "/wallets/:name/accounts/:index/dids/:id/methods/:frag",
  passwordAuth,
  deleteMethod,
);
router.patch(
  "/wallets/:name/accounts/:index/dids/:id/methods/:frag",
  passwordAuth,
  patchMethod,
);
router.post(
  "/wallets/:name/accounts/:index/dids/:id/services",
  passwordAuth,
  postServices,
);
router.delete(
  "/wallets/:name/accounts/:index/dids/:id/services/:frag",
  passwordAuth,
  deleteService,
);

export * from "./types";
export default router;
