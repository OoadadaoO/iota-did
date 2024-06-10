import { z } from "zod";
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodString>;
    ORG_NAME: z.ZodString;
    WALLET_BASEPATH: z.ZodString;
    DB_PASSWORD: z.ZodOptional<z.ZodString>;
    IOTA_API_ENDPOINT: z.ZodString;
    IOTA_FAUCET_ENDPOINT: z.ZodString;
}, "strip", z.ZodTypeAny, {
    PORT: string;
    ORG_NAME: string;
    WALLET_BASEPATH: string;
    IOTA_API_ENDPOINT: string;
    IOTA_FAUCET_ENDPOINT: string;
    DB_PASSWORD?: string | undefined;
}, {
    ORG_NAME: string;
    WALLET_BASEPATH: string;
    IOTA_API_ENDPOINT: string;
    IOTA_FAUCET_ENDPOINT: string;
    PORT?: string | undefined;
    DB_PASSWORD?: string | undefined;
}>;
type Env = z.infer<typeof envSchema>;
export declare const env: Env;
export {};
//# sourceMappingURL=index.d.ts.map