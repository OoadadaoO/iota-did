import type { PathLike } from "fs";
import { TextFile } from "lowdb/node";

import { Crypto } from "./crypto";

export class CustomAdapter<T> {
  #adapter;
  #parse;
  #stringify;
  constructor(filename: PathLike, password?: string) {
    this.#adapter = new TextFile(filename);
    if (password) {
      const crypto = new Crypto(password);
      this.#parse = (str: string) => JSON.parse(crypto.decrypt(str));
      this.#stringify = (data: T) => crypto.encrypt(JSON.stringify(data));
    } else {
      this.#parse = JSON.parse;
      this.#stringify = (data: T) => JSON.stringify(data, null, 2);
    }
  }
  async read() {
    const data = await this.#adapter.read();
    if (data === null) {
      return null;
    } else {
      return this.#parse(data);
    }
  }
  write(obj: T) {
    return this.#adapter.write(this.#stringify(obj));
  }
}
