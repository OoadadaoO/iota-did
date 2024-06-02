import { z } from "zod";

export const postAuthSchema = z.object({
  email: z.string(),
  password: z.string(),
  type: z.enum(["signup", "login"]),
});

export type PostAuth = z.infer<typeof postAuthSchema>;
