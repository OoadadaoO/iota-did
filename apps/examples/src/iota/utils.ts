import readlinePromises from "readline/promises";

import { DIDWallet } from "@did/iota";
import { MethodRelationship, MethodScope } from "@iota/identity-wasm/node";
import { CoinType } from "@iota/sdk";

const API_ENDPOINT = "http://140.112.18.206:14265";
const FAUCET_ENDPOINT = "http://140.112.18.206:8091/api/enqueue";

export async function initializeWallet(storagePath: string, password: string) {
  // initialize client and wait for it to load
  const wallet = new DIDWallet({
    storagePath: storagePath,
    clientOptions: {
      primaryNode: API_ENDPOINT,
      localPow: true,
    },
    coinType: CoinType.IOTA,
    password: {
      stronghold: password,
    },
  });
  await userIntialize(wallet);

  const didAddress = await wallet.getDIDAddress("First", 0);
  console.log(`DIDAddress > ${await didAddress.getBech32Address()}\n`);

  let ret;

  // Request funds
  if ((await didAddress.getBalance()) === 0n) {
    await didAddress.requestFunds(FAUCET_ENDPOINT);
  }
  // wait for funds to be received
  let balance = 0n;
  while (balance === 0n) {
    // Get the balance
    balance = (await didAddress.getBalance()) || 0n;
    if (balance > 0n) break;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log(`Balance > ${balance} tokens\n`);

  // Create a DID
  ret = await didAddress.createDid();
  console.log(`New DID Document: ${JSON.stringify(ret.document, null, 2)}\n`);

  // read the first DID from the db
  const didString = ret.document.id().toString();

  // Resolve a DID Document
  ret = await didAddress.resolveDid(didString);
  console.log(
    `Resolved DID Document: ${JSON.stringify(ret.document, null, 2)}\n`,
  );

  // Deactivate & Reactivate a DID Document
  ret = await didAddress.deactivateDid(didString);
  console.log(`Metadata deactivated: ${ret.document.metadataDeactivated()}\n`);
  ret = await didAddress.reactivateDid(didString);
  console.log(`Metadata deactivated: ${ret.document.metadataDeactivated()}\n`);

  // // Delete a DID Document
  // await client.deleteDid(did);

  // Update Did Document
  // Insert/Remove a new verification method (#fragment)
  ret = await didAddress.insertMethod(
    didString,
    MethodScope.VerificationMethod(),
  );
  console.log(`After insert method > ${JSON.stringify(ret.document, null, 2)}`);

  // Insert/Remove another new verification method
  ret = await didAddress.insertMethod(
    didString,
    MethodScope.VerificationMethod(),
  );
  const frag2 = ret.method.id().toString().split("#")[1];
  console.log(`After insert method > ${JSON.stringify(ret.document, null, 2)}`);

  // Insert/Remove a reference of verification method to a relationship
  ret = await didAddress.insertRelationship(
    didString,
    frag2,
    MethodRelationship.Authentication,
  );
  console.log(
    `After insert relationship > ${JSON.stringify(ret.document, null, 2)}`,
  );

  // Insert/Remove a new service
  ret = await didAddress.insertService(didString, "#linked-domain", {
    type: "LinkedDomains",
    serviceEndpoint: "https://example.com/",
  });
  console.log(
    `After insert service #LinkedDomains > ${JSON.stringify(ret.document, null, 2)}`,
  );

  // Add RevocationBitmap2022
  ret = await didAddress.insertRevokeService(didString, "#revocation");
  console.log(
    `After insert service #revocation > ${JSON.stringify(ret.document, null, 2)}`,
  );

  return wallet;
}

export async function userIntialize(wallet: DIDWallet) {
  const init = await wallet.isMnemonicStored();
  if (!init) {
    console.log("No mnemonic found.");
    const rl = readlinePromises.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const a = await rl.question(
      "No mnemonic found, choose an option: \n  1. Generate new mnemonic\n  2. Import existing mnemonic\nYour choice: ",
    );
    if (a === "1") {
      const mnemonic = DIDWallet.generateMnemonic();
      await wallet.storeMnemonic(mnemonic);
      console.log(
        "Here is your mnemonic: \n======================================\n",
        mnemonic,
        "\n======================================\nPlease store it in a safe place.",
      );
    } else if (a === "2") {
      const mnemonic = await rl.question("Enter your mnemonic: ");
      await wallet.storeMnemonic(mnemonic);
    }
    rl.close();
  }
}
