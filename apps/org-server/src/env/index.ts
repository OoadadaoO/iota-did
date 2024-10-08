import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "./.env" });

const envSchema = z.object({
  PORT: z.string().default("8001"),
  NAME: z.string(),
  WALLET_PASSWORD: z.string(),
  IOTA_API_ENDPOINT: z.string().url(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = {
  PORT: process.env.PORT!,
  NAME: process.env.NAME!,
  WALLET_PASSWORD: process.env.WALLET_PASSWORD!,
  IOTA_API_ENDPOINT: process.env.IOTA_API_ENDPOINT!,
};

envSchema.parse(env);
