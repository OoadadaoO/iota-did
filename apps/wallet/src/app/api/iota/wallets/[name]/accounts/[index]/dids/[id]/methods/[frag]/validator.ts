import { z } from "zod";

export const patchMethodSchema = z.object({
  scope: z.number(),
});

export type PatchMethod = z.infer<typeof patchMethodSchema>;
