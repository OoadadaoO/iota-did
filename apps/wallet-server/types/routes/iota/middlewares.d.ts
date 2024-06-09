import { Request, NextFunction } from "express";
import { DIDWallet } from "../../iota";
import { ErrorResponse, TypedResponse } from "../types";
export declare const passwordAuth: (req: Request<{
    name: string;
    wallet: DIDWallet;
    index: number;
}>, res: TypedResponse<ErrorResponse>, next: NextFunction) => Promise<void>;
//# sourceMappingURL=middlewares.d.ts.map