import { IotaDocument } from "@iota/identity-wasm/node";
export declare function didResponse(doc: IotaDocument): {
    did: string;
    method: import("@did/iota").GetMethodsResult;
    service: {
        fragment: string;
        type: string[];
        endpoint: string;
        text: string;
    }[];
    deactive: boolean;
    document: string;
};
//# sourceMappingURL=didResponse.d.ts.map