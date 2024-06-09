import { z } from "zod";

export const postServiceSchema = z.object({
  frag: z.string(),
  type: z.string(),
  serviceEndpoint: z.string().optional(),
});

export type PostService = z.infer<typeof postServiceSchema>;
