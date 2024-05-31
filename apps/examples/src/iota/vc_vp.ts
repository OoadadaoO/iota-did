import {
  Duration,
  IotaDID,
  RevocationBitmap,
  Timestamp,
} from "@iota/identity-wasm/node/index";

import { env } from "./env";
import { userIntialize } from "./utils";
import { initializeWallet } from "./utils";

const createNewDid = true; // Set to false to use existing DID

const iDidWallet = await initializeWallet(
  env.ISSUER_STORAGE_PATH,
  env.ISSUER_PASSWORD,
  createNewDid,
);
await userIntialize(iDidWallet);
const iDidAddress = await iDidWallet.getDIDAddress(0, 0);
const [issuerDoc] = await iDidAddress.getDids();
const issuerDid = issuerDoc.id().toString();
const issuerFragment = (await iDidAddress.resolveDid(issuerDid))
  .methods()[0]
  .id()
  .fragment()!;
console.log(`Issuer DID: ${issuerDid}\nIssuer Fragment: ${issuerFragment}\n`);

const holderWallet = await initializeWallet(
  env.HOLDER_STORAGE_PATH,
  env.HOLDER_PASSWORD,
  createNewDid,
);
await userIntialize(holderWallet);
const holderAddress = await holderWallet.getDIDAddress(0, 0);
const [holderDoc] = await holderAddress.getDids();
const holderDid = holderDoc.id().toString();
const holderFragment = (await holderAddress.resolveDid(holderDid))
  .methods()[0]
  .id()
  .fragment()!;
console.log(`Holder DID: ${holderDid}\nHolder Fragment: ${holderFragment}\n`);

let ret;

// console.log(JSON.stringify(await issuer.resolveDid(issuerDid), null, 2), '\n');
// console.log(JSON.stringify(await holder.resolveDid(holderDid), null, 2), '\n');

// Initialization: Unrevoke the VC
try {
  await iDidAddress.unrevokeVC(
    issuerDid,
    env.ISSUER_ROVOKE_FRAGMENT,
    env.HOLDER_REVOKE_INDEX,
  );
} catch (error) {
  console.log("Has unrevoked!", "\n");
}

// Create a Rovocable VC
const vc = await iDidAddress.createVC(
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
      id: IotaDID.parse(issuerDid).join(env.ISSUER_ROVOKE_FRAGMENT).toString(),
      type: RevocationBitmap.type(),
      revocationBitmapIndex: env.HOLDER_REVOKE_INDEX.toString(),
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
await iDidAddress.revokeVC(
  issuerDid,
  env.ISSUER_ROVOKE_FRAGMENT,
  env.HOLDER_REVOKE_INDEX,
);
try {
  ret = await holderAddress.validateVC(vc);
  console.log(`Revoke Failed! Credential > `, ret.credential, "\n");
} catch (e) {
  console.log(`Revoke successfully! Error during validation: ${e}`, "\n");
}

// Unrevoke the VC
await iDidAddress.unrevokeVC(
  issuerDid,
  env.ISSUER_ROVOKE_FRAGMENT,
  env.HOLDER_REVOKE_INDEX,
);
try {
  ret = await holderAddress.validateVC(vc);
  console.log(`Unrevoke successfully! Credential > `, ret.credential, "\n");
} catch (e) {
  console.log(`Unrevoke Failed! Error during validation: ${e}`, "\n");
}

// Create VP
const nonce = "nosv8-dscsdv-csdvs-vsdvsd";
const expirationDate = Timestamp.nowUTC().checkedAdd(Duration.minutes(10));
const vp = await holderAddress.createVP(
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
