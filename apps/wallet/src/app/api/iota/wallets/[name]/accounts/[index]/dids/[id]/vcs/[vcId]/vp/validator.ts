import { z } from "zod";

export const postVpSchema = z.object({
  fragment: z.string(),
  periodMinutes: z.number(),
});

export type PostVp = z.infer<typeof postVpSchema>;
