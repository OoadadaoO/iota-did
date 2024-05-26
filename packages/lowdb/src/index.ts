import type { PathLike } from "fs";
import { Low } from "lowdb";

import { CustomAdapter } from "./adapter";

export type AdapterOptions = {
  filename: PathLike;
  password?: string;
};

export class LowDB<T> extends Low<T> {
  constructor(adapterOptions: AdapterOptions, defaultValue: T) {
    super(
      new CustomAdapter<T>(adapterOptions.filename, adapterOptions.password),
      defaultValue,
    );
  }
}
