import { IotaClient } from "@did/iota";
import {
  Duration,
  IotaDID,
  RevocationBitmap,
  Timestamp,
} from "@iota/identity-wasm/node";

import { initializeWallet } from "./utils";

const API_ENDPOINT = "http://140.112.18.206:14265";
const ISSUER_WALLET = "./db/issuer.json";
const ISSUER_ROVOKE_FRAGMENT = "#revocation";
const HOLDER_WALLET = "./db/holder.json";

const revokeIndex = 1;

await initializeWallet(ISSUER_WALLET);
await initializeWallet(HOLDER_WALLET);

const issuer = await IotaClient.build(
  {
    primaryNode: API_ENDPOINT,
  },
  {
    filename: ISSUER_WALLET,
  },
);
const issuerDid = issuer.db.data.docs[0]?.id;
const issuerFragment = issuer.db.data.docs[0]?.methods[0].fragment;

const holder = await IotaClient.build(
  {
    primaryNode: API_ENDPOINT,
  },
  {
    filename: HOLDER_WALLET,
  },
);
const holderDid = holder.db.data.docs[0]?.id;
const holderFragment = holder.db.data.docs[0]?.methods[0].fragment;

let ret;

console.log(issuer.db === holder.db);

// console.log(JSON.stringify(await issuer.resolveDid(issuerDid), null, 2), '\n');
// console.log(JSON.stringify(await holder.resolveDid(holderDid), null, 2), '\n');

// Initialization: Unrevoke the VC
try {
  await issuer.unrevokeVC(issuerDid, ISSUER_ROVOKE_FRAGMENT, revokeIndex);
} catch (error) {
  console.log("Has unrevoked!", "\n");
}

// Create a Rovocable VC
const { vc } = await issuer.createVC(
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
ret = await holder.validateVC(vc);
console.log("Credential > ", ret.credential, "\n");

// Revoke the VC
await issuer.revokeVC(issuerDid, ISSUER_ROVOKE_FRAGMENT, revokeIndex);
try {
  ret = await holder.validateVC(vc);
  console.log(`Revoke Failed! Credential > `, ret.credential, "\n");
} catch (e) {
  console.log(`Revoke successfully! Error during validation: ${e}`, "\n");
}

// Unrevoke the VC
await issuer.unrevokeVC(issuerDid, ISSUER_ROVOKE_FRAGMENT, revokeIndex);
try {
  ret = await holder.validateVC(vc);
  console.log(`Unrevoke successfully! Credential > `, ret.credential, "\n");
} catch (e) {
  console.log(`Unrevoke Failed! Error during validation: ${e}`, "\n");
}

// Create VP
const nonce = "nosv8-dscsdv-csdvs-vsdvsd";
const expirationDate = Timestamp.nowUTC().checkedAdd(Duration.minutes(10));
const { vp } = await holder.createVP(
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
ret = await issuer.validateVP(vp, { nonce });
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
