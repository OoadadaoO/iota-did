import { type AdapterOptions, LowDB } from "@did/lowdb";
import { Credential } from "../routes/iota";
export type VcSchema = {
    [id: string]: {
        id: string;
        did: string;
        jwt: string;
        credential: Credential;
    };
};
export type VcDbptions = AdapterOptions;
export declare class VcDb extends LowDB<VcSchema> {
    #private;
    private constructor();
    static getInstance(b64uName: string): Promise<VcDb>;
}
//# sourceMappingURL=index.d.ts.map