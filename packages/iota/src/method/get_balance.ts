import type { IotaClient } from "..";

export async function getBalance(
  this: IotaClient,
): Promise<bigint | undefined> {
  const { client, db } = this;

  try {
    const outputIds = await client.basicOutputIds([
      { address: db.data.bech32Address },
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
