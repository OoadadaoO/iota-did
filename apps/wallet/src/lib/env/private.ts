import { z } from "zod";

const privateEnvSchema = z.object({
  NODE_ENV: z.string(),
  AUTH_SECRET: z.string(),
  AUTH_EXPIRES: z.string(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  NODE_ENV: process.env.NODE_ENV!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  AUTH_EXPIRES: process.env.AUTH_EXPIRES!,
};

privateEnvSchema.parse(privateEnv);
