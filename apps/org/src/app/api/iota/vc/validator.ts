import { z } from "zod";

export const postVcSchema = z.object({
  did: z.string(),
});

export type PostVc = z.infer<typeof postVcSchema>;
