import { z } from "zod";

export const putConfigSchema = z.object({
  issuerDid: z.string(),
  issuerFragment: z.string(),
  revokeFragment: z.string(),
  allowedIssuers: z.array(
    z.object({
      name: z.string(),
      did: z.string(),
    }),
  ),
});

export type PutConfig = z.infer<typeof putConfigSchema>;
