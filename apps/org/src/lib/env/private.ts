import { z } from "zod";

const privateEnvSchema = z.object({
  NODE_ENV: z.string(),
  AUTH_SALT_ROUNDS: z.number(),
  AUTH_SECRET: z.string(),
  AUTH_EXPIRES: z.string(),
  DB_FILEPATH: z.string(),
  DB_PASSWORD: z.string().optional(),
});

type PrivateEnv = z.infer<typeof privateEnvSchema>;

export const privateEnv: PrivateEnv = {
  NODE_ENV: process.env.NODE_ENV!,
  AUTH_SALT_ROUNDS: parseInt(process.env.AUTH_SALT_ROUNDS!),
  AUTH_SECRET: process.env.AUTH_SECRET!,
  AUTH_EXPIRES: process.env.AUTH_EXPIRES!,
  DB_FILEPATH: process.env.DB_FILEPATH!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
};

privateEnvSchema.parse(privateEnv);
