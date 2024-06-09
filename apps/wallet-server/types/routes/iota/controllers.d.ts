import { Request } from "express";
import { DIDWallet } from "../../iota";
import { TypedResponse } from "../types";
import { DeleteDidResponse, DeleteMethodResponse, DeleteServiceResponse, GetAccountsResponse, GetBalanceResponse, GetDidsResponse, GetFaucetResponse, GetWalletsResponse, PatchDidResponse, PatchMethodResponse, PostAccountsResponse, PostDidsResponse, PostMethodsResponse, PostPasswordResponse, PostServicesResponse, PostWalletsResponse } from "./types";
export declare const getWallets: (req: Request, res: TypedResponse<GetWalletsResponse>) => Promise<void>;
export declare const postWallets: (req: Request<never, never, {
    name: string;
    password: string;
    mnemonic: string;
}>, res: TypedResponse<PostWalletsResponse>) => Promise<TypedResponse<PostWalletsResponse> | undefined>;
export declare const postPassword: (req: Request<{
    name: string;
    wallet: DIDWallet;
}>, res: TypedResponse<PostPasswordResponse>) => Promise<void>;
export declare const getAccounts: (req: Request<{
    name: string;
    wallet: DIDWallet;
}>, res: TypedResponse<GetAccountsResponse>) => Promise<void>;
export declare const postAccounts: (req: Request<{
    name: string;
    wallet: DIDWallet;
}>, res: TypedResponse<PostAccountsResponse>) => Promise<void>;
export declare const getBalance: (req: Request<{
    name: string;
    index: number;
    wallet: DIDWallet;
}>, res: TypedResponse<GetBalanceResponse>) => Promise<void>;
export declare const getFundsFromFaucet: (req: Request<{
    name: string;
    index: number;
    wallet: DIDWallet;
}>, res: TypedResponse<GetFaucetResponse>) => Promise<TypedResponse<GetFaucetResponse> | undefined>;
export declare const getDIDs: (req: Request<{
    name: string;
    index: number;
    wallet: DIDWallet;
}>, res: TypedResponse<GetDidsResponse>) => Promise<void>;
export declare const postDIDs: (req: Request<{
    name: string;
    index: number;
    wallet: DIDWallet;
}>, res: TypedResponse<PostDidsResponse>) => Promise<void>;
export declare const patchDid: (req: Request<{
    name: string;
    index: number;
    id: string;
    wallet: DIDWallet;
}, never, {
    deactivate: boolean;
}>, res: TypedResponse<PatchDidResponse>) => Promise<void>;
export declare const deleteDid: (req: Request<{
    name: string;
    index: number;
    id: string;
    wallet: DIDWallet;
}>, res: TypedResponse<DeleteDidResponse>) => Promise<void>;
export declare const postMethods: (req: Request<{
    name: string;
    index: number;
    id: string;
    wallet: DIDWallet;
}>, res: TypedResponse<PostMethodsResponse>) => Promise<void>;
export declare const deleteMethod: (req: Request<{
    name: string;
    index: number;
    id: string;
    frag: string;
    wallet: DIDWallet;
}>, res: TypedResponse<DeleteMethodResponse>) => Promise<void>;
export declare const patchMethod: (req: Request<{
    name: string;
    index: number;
    id: string;
    frag: string;
    wallet: DIDWallet;
}, never, {
    scope: number;
}>, res: TypedResponse<PatchMethodResponse>) => Promise<void>;
export declare const postServices: (req: Request<{
    name: string;
    index: number;
    id: string;
    wallet: DIDWallet;
}, never, {
    frag: string;
    type: string;
    serviceEndpoint: string;
}>, res: TypedResponse<PostServicesResponse>) => Promise<void>;
export declare const deleteService: (req: Request<{
    name: string;
    index: number;
    id: string;
    frag: string;
    wallet: DIDWallet;
}>, res: TypedResponse<DeleteServiceResponse>) => Promise<void>;
//# sourceMappingURL=controllers.d.ts.map