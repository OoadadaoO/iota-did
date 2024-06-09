import { Request, NextFunction } from "express";

import { DIDWallet } from "../../iota";
import { b64uToUtf8 } from "../../utils/base64url";
import { ErrorResponse, TypedResponse } from "../types";

export const passwordAuth = async (
  req: Request<{ name: string; wallet: DIDWallet; index: number }>,
  res: TypedResponse<ErrorResponse>,
  next: NextFunction,
) => {
  try {
    const name = b64uToUtf8(req.params.name);
    const wallet = await DIDWallet.getInstance(name);
    req.params.wallet = wallet;
    const hasPassword = await wallet.isStrongholdPasswordAvailable();
    if (hasPassword) {
      next();
      return;
    }
    const password = req.get("X-Password") || "";
    const clearInterval = req.get("X-Password-Life") || "";
    if (!password || !clearInterval) {
      throw new Error("Password is required");
    }
    await wallet.setStrongholdPassword(password);
    await wallet.setStrongholdPasswordClearInterval(
      parseInt(clearInterval, 10),
    );
    wallet.setSecretManagerType((prev) => ({
      stronghold: {
        ...prev.stronghold,
        password,
      },
    }));
    next();
    return;
  } catch (err: any) {
    console.error(err);
    res
      .status(200)
      .json({ error: { code: 401, message: err.message || "Unauthorized" } });
  }
};
