import type { DIDAddress } from "../../DIDAddress";

export async function requestFunds(this: DIDAddress, faucetEndpoint: string) {
  const bech32Address = await this.getBech32Address();

  const requestObj = JSON.stringify({ address: bech32Address });
  let errorMessage, data;
  try {
    const response = await fetch(faucetEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: requestObj,
    });
    if (response.status === 202) {
      errorMessage = "OK";
    } else if (response.status === 429) {
      errorMessage = "too many requests, please try again later.";
    } else {
      data = await response.json();
      // @ts-expect-error data is not null
      errorMessage = data.error.message;
    }
  } catch (error) {
    errorMessage = error;
  }

  if (errorMessage != "OK") {
    throw new Error(`failed to get funds from faucet: ${errorMessage}`);
  }
}