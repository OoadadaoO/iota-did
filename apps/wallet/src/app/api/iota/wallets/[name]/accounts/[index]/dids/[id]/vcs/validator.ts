import { z } from "zod";

export const postVcsSchema = z.object({
  jwt: z.string(),
});

export type PostVcs = z.infer<typeof postVcsSchema>;
