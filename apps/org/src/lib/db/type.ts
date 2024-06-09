/** All user */
export type UserType = {
  id: string;
  username: string;
  email: string;
  hashedPassword: string;
  /** Decimal of binary permission */
  permission: number;
};

/** VC of member of self */
export type MemberCredentialType = {
  id: string;
  userId: string;
  /** did of user */
  did: string;
  /** raw jwt string */
  jwt: string;
  /** cred content */
  content: string;
  /** did of issuer */
  issuerdid: string;
  /** fragment of issuer */
  issuerFragment: string;
  /** Bitmap method */
  revokeFragment: string;
  /** Bitmap index */
  revokeIndex: number;
};

/** VC of member of partners */
export type PartnerCredentialType = {
  id: string;
  userId: string;
  /** raw jwt string */
  jwt: string;
  /** did of issuer */
  issuer: string;
  /** ISO 8601 datetime, for validation after a time interval */
  lastValidAt: string;
};

/** DID of partners for issue vc */
export type AllowedDidType = {
  id: string;
  /** name of partner */
  name: string;
  /** did of partner */
  did: string;
};
