import { z } from "zod";

const privateEnvSchema = z.object({
  NODE_ENV: z.string(),
  PASSWORD_SECRET: z.string(),
  PASSWORD_EXPIRES: z.string(),
  IOTA_EXPRESS_URL: z.string().url(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  NODE_ENV: process.env.NODE_ENV!,
  PASSWORD_SECRET: process.env.PASSWORD_SECRET!,
  PASSWORD_EXPIRES: process.env.PASSWORD_EXPIRES!,
  IOTA_EXPRESS_URL: process.env.IOTA_EXPRESS_URL!,
};

privateEnvSchema.parse(privateEnv);
