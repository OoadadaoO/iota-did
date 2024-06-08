import { DIDWallet as DWallet, type DIDAddress } from "@did/iota";
export declare class DIDWallet extends DWallet {
    #private;
    private constructor();
    static getInstance(): Promise<{
        wallet: DIDWallet;
        address: DIDAddress;
    }>;
}
//# sourceMappingURL=index.d.ts.map