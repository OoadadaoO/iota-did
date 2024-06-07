import { z } from "zod";

export const putConfigSchema = z.object({
  issueDid: z.string(),
  issueFragment: z.string(),
  revokeFragment: z.string(),
});

export type PutConfig = z.infer<typeof putConfigSchema>;
