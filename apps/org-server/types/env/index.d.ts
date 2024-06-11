import { z } from "zod";
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodString>;
    NAME: z.ZodString;
    WALLET_PASSWORD: z.ZodString;
    IOTA_API_ENDPOINT: z.ZodString;
}, "strip", z.ZodTypeAny, {
    PORT: string;
    NAME: string;
    WALLET_PASSWORD: string;
    IOTA_API_ENDPOINT: string;
}, {
    NAME: string;
    WALLET_PASSWORD: string;
    IOTA_API_ENDPOINT: string;
    PORT?: string | undefined;
}>;
type Env = z.infer<typeof envSchema>;
export declare const env: Env;
export {};
//# sourceMappingURL=index.d.ts.map