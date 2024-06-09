import { z } from "zod";

export const patchDidSchema = z.object({
  deactivate: z.boolean(),
});

export type PatchDid = z.infer<typeof patchDidSchema>;
