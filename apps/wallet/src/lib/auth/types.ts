import type { UserType } from "../db/type";

export type Session =
  | {
      user: Omit<UserType, "hashedPassword">;
      expires: Date;
      message?: never;
    }
  | {
      user?: never;
      expires?: never;
      message: string;
    };

export type Token = {
  /** userId */
  sub: string;
};
