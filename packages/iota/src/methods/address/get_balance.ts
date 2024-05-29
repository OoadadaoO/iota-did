import type { DIDAddress } from "../../DIDAddress";

export async function getBalance(
  this: DIDAddress,
): Promise<bigint | undefined> {
  const client = await this.getClient();
  const bech32Address = await this.getBech32Address();

  try {
    const outputIds = await client.basicOutputIds([
      { address: bech32Address },
      { hasExpiration: false },
      { hasTimelock: false },
      { hasStorageDepositReturn: false },
    ]);
    const outputs = await client.getOutputs(outputIds.items);

    let totalAmount = BigInt(0);
    for (const output of outputs) {
      totalAmount += output.output.getAmount();
    }

    return totalAmount;
  } catch (error) {
    console.log(`Error while getting balance: ${error}`);
  }
}
