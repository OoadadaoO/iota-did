import type { PathLike } from "fs";
import { DataFile } from "lowdb/node";

import { Crypto } from "./crypto";

export class CustomAdapter<T> extends DataFile<T> {
  constructor(filename: PathLike, password?: string) {
    if (password) {
      const crypto = new Crypto(password);
      super(filename, {
        parse: (str: string) => JSON.parse(crypto.decrypt(str)),
        stringify: (data: T) => crypto.encrypt(JSON.stringify(data)),
      });
    } else {
      super(filename, {
        parse: JSON.parse,
        stringify: (data: T) => JSON.stringify(data, null, 2),
      });
    }
  }
}
