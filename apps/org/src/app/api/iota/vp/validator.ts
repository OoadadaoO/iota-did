import { z } from "zod";

export const postValidateVcSchema = z.object({
  jwt: z.string(),
});

export type PostValidateVc = z.infer<typeof postValidateVcSchema>;
