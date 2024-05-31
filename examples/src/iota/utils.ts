import readlinePromises from "readline/promises";

import {
  DIDWallet,
  getAccountsData,
  getClassfiedMethods,
  getDidDocuments,
  getServices,
} from "@did/iota";
import {
  MethodRelationship,
  MethodScope,
} from "@iota/identity-wasm/node/index";
import { CoinType } from "@iota/sdk";

import { env } from "./env";

export async function initializeWallet(
  storagePath: string,
  password: string,
  createNewDid: boolean = true,
) {
  // ===========================================================================
  // Wallet Initialization
  // ===========================================================================
  const wallet = new DIDWallet({
    storagePath: storagePath,
    clientOptions: {
      primaryNode: env.API_ENDPOINT,
      localPow: true,
    },
    coinType: CoinType.Shimmer,
    password: {
      stronghold: password,
    },
  });
  await userIntialize(wallet);

  if (!createNewDid) return wallet;

  const walletDetails = await getWalletDetails(wallet);
  console.log(`Wallet Details > ${JSON.stringify(walletDetails, null, 2)}\n`);

  const didAddress = await wallet.getDIDAddress(0, 0);

  const bech32Address = await didAddress.getBech32Address();
  console.log(`Address > ${bech32Address}\n`);

  const dids = (await didAddress.getDids()).map((doc) => doc.id().toString());
  console.log(`DIDs > ${JSON.stringify(dids, null, 2)}\n`);

  // ===========================================================================
  // DID Operations
  // ===========================================================================
  let ret;

  // Request funds
  if ((await didAddress.getBalance()) === 0n) {
    await didAddress.requestFunds(env.FAUCET_ENDPOINT);
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
  console.log(`New DID Document: ${JSON.stringify(ret, null, 2)}\n`);

  // read the first DID from the db
  const didString = ret.id().toString();

  // Resolve a DID Document
  ret = await didAddress.resolveDid(didString);
  console.log(`Resolved DID Document: ${JSON.stringify(ret, null, 2)}\n`);

  // Deactivate & Reactivate a DID Document
  console.log(`Metadata deactivated: ${ret.metadataDeactivated()}\n`);
  ret = await didAddress.deactivateDid(didString);
  console.log(`Metadata deactivated: ${ret.metadataDeactivated()}\n`);
  ret = await didAddress.reactivateDid(didString);
  console.log(`Metadata deactivated: ${ret.metadataDeactivated()}\n`);

  // Insert/Remove a new verification method (#fragment)
  ret = await didAddress.insertMethod(
    didString,
    MethodScope.VerificationMethod(),
  );
  console.log(`DID after insert method > ${JSON.stringify(ret, null, 2)}\n`);
  const frag2 = ret.methods()[0].id().toString().split("#")[1];

  // Insert/Remove a reference of verification method to a relationship
  ret = await didAddress.insertRelationship(
    didString,
    frag2,
    MethodRelationship.Authentication,
  );
  console.log(
    `DID after insert relationship > ${JSON.stringify(ret, null, 2)}\n`,
  );

  // Insert/Remove a new service
  ret = await didAddress.insertService(didString, "#linked-domain", {
    type: "LinkedDomains",
    serviceEndpoint: "https://example.com/",
  });
  console.log(
    `DID after insert service #LinkedDomains > ${JSON.stringify(ret, null, 2)}\n`,
  );

  // Add RevocationBitmap2022
  ret = await didAddress.insertRevokeService(didString, "#revocation");
  console.log(
    `DID after insert service #revocation > ${JSON.stringify(ret, null, 2)}\n`,
  );

  const newWalletDetails = await getWalletDetails(wallet);
  console.log(
    `Wallet Details > ${JSON.stringify(newWalletDetails, null, 2)}\n`,
  );

  return wallet;
}

export async function getWalletDetails(wallet: DIDWallet) {
  const accounts = await getAccountsData(wallet);
  const walletDetails = await Promise.all(
    accounts.map(async (account) => ({
      name: account.name,
      index: account.index,
      addresses: await Promise.all(
        account.addresses.map(async (address) => ({
          index: address.getMetadata().addressIndex,
          documents: (await getDidDocuments(address)).map((doc) => ({
            did: doc.id().toString(),
            method: getClassfiedMethods(doc, true),
            service: getServices(doc).map((s) => s.id().fragment()!),
          })),
        })),
      ),
    })),
  );
  return walletDetails;
}

export async function userIntialize(wallet: DIDWallet) {
  const init = await wallet.isMnemonicStored();
  if (!init) {
    console.log("No mnemonic found.");
    const rl = readlinePromises.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    let a = "0";
    while (a !== "1" && a !== "2") {
      a = await rl.question(
        "No mnemonic found, choose an option: \n  1. Generate new mnemonic\n  2. Import existing mnemonic\nYour choice: ",
      );
      if (a === "1") {
        const mnemonic = DIDWallet.generateMnemonic();
        await wallet.storeMnemonic(mnemonic);
        console.log(
          `\nHere is your mnemonic: \n======================================\n${mnemonic}\n======================================\nPlease store it in a safe place.\n`,
        );
      } else if (a === "2") {
        const mnemonic = await rl.question("Enter your mnemonic: ");
        await wallet.storeMnemonic(mnemonic);
      }
      rl.close();
    }
  }
  await wallet.startBackgroundSync();
}
