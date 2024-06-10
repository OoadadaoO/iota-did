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
  issuerDid: string;
  /** fragment of issuer */
  issuerFragment: string;
  /** Bitmap method */
  revokeFragment: string;
  /** Bitmap index */
  revokeIndex: string;
};

/** VC of member of partners */
export type PartnerCredentialType = {
  id: string;
  userId: string;
  /** did of user */
  did: string;
  /** raw jwt string */
  jwt: string;
  /** cred content */
  content: string;
  /** did of issuer */
  issuerDid: string;
  /** fragment of issuer */
  issuerFragment: string;
  /** Bitmap method */
  revokeFragment: string;
  /** Bitmap index */
  revokeIndex: string;
  /** ISO 8601 datetime, when the credential needs to be validated */
  expiredAt: string;
};

/** DID of partners for issue vc */
export type AllowedDidType = {
  id: string;
  /** name of partner */
  name: string;
  /** did of partner */
  did: string;
};
