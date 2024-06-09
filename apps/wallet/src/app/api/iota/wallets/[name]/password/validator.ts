import { z } from "zod";

export const postPasswordSchema = z.object({
  password: z.string(),
});

export type PostPassword = z.infer<typeof postPasswordSchema>;
