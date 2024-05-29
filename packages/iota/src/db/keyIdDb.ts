import { type AdapterOptions, LowDB } from "@did/lowdb";

export type KeyIdSchema = {
  [prefixMethodDigest: string]: {
    keyId: string;
    fragment: string;
    alias?: string;
  };
};

export const defaultKeyId: KeyIdSchema = {};

export type KeyIdDbptions = AdapterOptions;

/**
 * key is joined by `accountIndex` and `methodDigest`
 * ```json
 * {
 *   "0/AHbAAZrgLakW": {
 *     "keyId": "0:0:AHbAAZrgLakW",
 *     "fragment": "#TsJUp62ZeeaHhq2Gbp_7Onz8dnvEP9RtcfLml7Uwkuk",
 *     "alias": "enrollment-key"
 *   }
 * }
 * ```
 */
export class KeyIdDb extends LowDB<KeyIdSchema> {
  constructor(adapterOptions: KeyIdDbptions) {
    super(adapterOptions, JSON.parse(JSON.stringify(defaultKeyId)));
  }
}
