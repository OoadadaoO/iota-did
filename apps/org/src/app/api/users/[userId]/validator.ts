import { z } from "zod";

export const patchUserSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  permission: z.number().optional(),
});

export type PatchUser = z.infer<typeof patchUserSchema>;
