import { z } from "zod";

export const postWalletSchema = z.object({
  name: z.string(),
  password: z.string(),
  mnemonic: z.string().optional(),
});

export type PostWallet = z.infer<typeof postWalletSchema>;
