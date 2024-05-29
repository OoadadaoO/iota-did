// import { DIDWallet } from "@did/iota";
import {
  Duration,
  IotaDID,
  RevocationBitmap,
  Timestamp,
} from "@iota/identity-wasm/node";

// import { CoinType } from "@iota/sdk";
import { userIntialize } from "./utils";
import { initializeWallet } from "./utils";

const ISSUER_STORAGE_PATH = "./wallet/issuer";
const ISSUER_PASSWORD = "issuer-password";
const ISSUER_ROVOKE_FRAGMENT = "#revocation";
const HOLDER_STORAGE_PATH = "./wallet/holder";
const HOLDER_PASSWORD = "holder-password";

// const API_ENDPOINT = "http://140.112.18.206:14265";

const revokeIndex = 1;

const iDidWallet = await initializeWallet(ISSUER_STORAGE_PATH, ISSUER_PASSWORD);
// const iDidWallet = new DIDWallet({
//   storagePath: ISSUER_STORAGE_PATH,
//   clientOptions: {
//     primaryNode: API_ENDPOINT,
//     localPow: true,
//   },
//   coinType: CoinType.IOTA,
//   password: {
//     stronghold: ISSUER_PASSWORD,
//   },
// });
await userIntialize(iDidWallet);
const iDidAddress = await iDidWallet.getDIDAddress("First", 0);
const iDidDb = await iDidAddress.getDidDb();
const issuerDid = Object.keys(iDidDb.data)[0].split("/")[2];
const issuerFragment = (await iDidAddress.resolveDid(issuerDid)).document
  .methods()[0]
  .id()
  .fragment()!;
console.log(`Issuer DID: ${issuerDid}\nIssuer Fragment: ${issuerFragment}\n`);

const holderWallet = await initializeWallet(
  HOLDER_STORAGE_PATH,
  HOLDER_PASSWORD,
);
// const holderWallet = new DIDWallet({
//   storagePath: HOLDER_STORAGE_PATH,
//   clientOptions: {
//     primaryNode: API_ENDPOINT,
//     localPow: true,
//   },
//   coinType: CoinType.IOTA,
//   password: {
//     stronghold: HOLDER_PASSWORD,
//   },
// });
await userIntialize(holderWallet);
const holderAddress = await holderWallet.getDIDAddress("First", 0);
const holderDb = await holderAddress.getDidDb();
const holderDid = Object.keys(holderDb.data)[0].split("/")[2];
const holderFragment = (await holderAddress.resolveDid(holderDid)).document
  .methods()[0]
  .id()
  .fragment()!;
console.log(`Holder DID: ${holderDid}\nHolder Fragment: ${holderFragment}\n`);

let ret;

// console.log(JSON.stringify(await issuer.resolveDid(issuerDid), null, 2), '\n');
// console.log(JSON.stringify(await holder.resolveDid(holderDid), null, 2), '\n');

// Initialization: Unrevoke the VC
try {
  await iDidAddress.unrevokeVC(issuerDid, ISSUER_ROVOKE_FRAGMENT, revokeIndex);
} catch (error) {
  console.log("Has unrevoked!", "\n");
}

// Create a Rovocable VC
const { vc } = await iDidAddress.createVC(
  issuerDid,
  issuerFragment,
  {
    id: "http://example.edu/credentials/3732",
    type: "UniversityDegreeCredential",
    issuer: issuerDid,
    credentialSubject: {
      id: holderDid,
      name: "Alice",
      degreeName: "Bachelor of Science and Arts of National Taiwan University",
      degreeType: "BachelorDegree of National Taiwan University",
      GPA: "4.0",
    },
    credentialStatus: {
      id: IotaDID.parse(issuerDid).join(ISSUER_ROVOKE_FRAGMENT).toString(),
      type: RevocationBitmap.type(),
      revocationBitmapIndex: revokeIndex.toString(),
    },
  },
  {},
  { exp: Math.trunc(Date.now() / 1000 + 60 * 10) },
);
console.log("VC > ", vc.toJSON(), "\n");

// Validate the VC
ret = await holderAddress.validateVC(vc);
console.log("Credential > ", ret.credential, "\n");

// Revoke the VC
await iDidAddress.revokeVC(issuerDid, ISSUER_ROVOKE_FRAGMENT, revokeIndex);
try {
  ret = await holderAddress.validateVC(vc);
  console.log(`Revoke Failed! Credential > `, ret.credential, "\n");
} catch (e) {
  console.log(`Revoke successfully! Error during validation: ${e}`, "\n");
}

// Unrevoke the VC
await iDidAddress.unrevokeVC(issuerDid, ISSUER_ROVOKE_FRAGMENT, revokeIndex);
try {
  ret = await holderAddress.validateVC(vc);
  console.log(`Unrevoke successfully! Credential > `, ret.credential, "\n");
} catch (e) {
  console.log(`Unrevoke Failed! Error during validation: ${e}`, "\n");
}

// Create VP
const nonce = "nosv8-dscsdv-csdvs-vsdvsd";
const expirationDate = Timestamp.nowUTC().checkedAdd(Duration.minutes(10));
const { vp } = await holderAddress.createVP(
  holderDid,
  holderFragment,
  {
    holder: holderDid,
    verifiableCredential: [vc],
  },
  { nonce },
  { expirationDate: expirationDate }, // or { customClaims: { exp: Math.trunc(Date.now() / 1000 + 60 * 10) } },
);
console.log("VP > ", vp.toJSON(), "\n");

// Validate the VP
ret = await iDidAddress.validateVP(vp, { nonce });
console.log(
  "Presentation > ",
  JSON.stringify(
    {
      ...ret.presentation.toJSON(),
      verifiableCredential: ret.credentials,
    },
    null,
    2,
  ),
  "\n",
);
