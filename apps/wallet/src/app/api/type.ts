export type Response<T> = {
  data: T;
  error?: never;
};

export type ErrorResponse = {
  data?: never;
  error: {
    code: number;
    message: string;
  };
};

export * from "./iota/wallets/type";
export * from "./iota/wallets/[name]/password/type";
export * from "./iota/wallets/[name]/accounts/type";
export * from "./iota/wallets/[name]/accounts/[index]/balance/type";
export * from "./iota/wallets/[name]/accounts/[index]/faucet/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/methods/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/methods/[frag]/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/services/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/services/[frag]/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/vcs/type";
export * from "./iota/wallets/[name]/accounts/[index]/dids/[id]/vcs/[vcId]/type";
