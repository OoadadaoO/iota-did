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

export * from "./auth/type";
export * from "./auth/session/type";
export * from "./iota/dids/type";
export * from "./iota/vc/type";
export * from "./iota/vp/type";
export * from "./config/type";
export * from "./users/[userId]/type";
