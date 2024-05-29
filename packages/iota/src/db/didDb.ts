import { type AdapterOptions, LowDB } from "@did/lowdb";

export type DidSchema = {
  [prefixIotaDid: string]: {
    activate: boolean;
    alias?: string;
  };
};

export const defaultDid: DidSchema = {};

export type DidDbOptions = AdapterOptions;

/**
 * key is joined by `accountIndex`, `addressIndex, and `Iota Did`
 * ```json
 * {
 *   "0/0/Did:iota:tst:0x53066c42770c9775cfa5c8cb72851802191ae306c510ff82ee25e79015d5d12b": [
 *     {
 *       "alias": "ntu-student"
 *     }
 *   ]
 * }
 * ```
 */
export class DidDb extends LowDB<DidSchema> {
  constructor(adapterOptions: DidDbOptions) {
    super(adapterOptions, JSON.parse(JSON.stringify(defaultDid)));
  }
}
