import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "./.env" });

const envSchema = z.object({
  PORT: z.string().default("8001"),
  ORG_NAME: z.string(),
  WALLET_BASEPATH: z.string(),
  DB_PASSWORD: z.string().optional(),
  IOTA_API_ENDPOINT: z.string().url(),
  IOTA_FAUCET_ENDPOINT: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = {
  PORT: process.env.PORT!,
  ORG_NAME: process.env.ORG_NAME!,
  WALLET_BASEPATH: process.env.WALLET_BASEPATH!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  IOTA_API_ENDPOINT: process.env.IOTA_API_ENDPOINT!,
  IOTA_FAUCET_ENDPOINT: process.env.IOTA_FAUCET_ENDPOINT!,
};

envSchema.parse(env);