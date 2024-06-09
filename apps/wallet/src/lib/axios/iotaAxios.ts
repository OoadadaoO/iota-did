import axios from "axios";

import { privateEnv } from "../env/private";
import { parseTimeToMilliSeconds } from "../utils/parseTimeToMilliSeconds";

export const iotaAxios = axios.create({
  baseURL: privateEnv.IOTA_EXPRESS_URL,
  headers: {
    "X-Password-Life": parseTimeToMilliSeconds(privateEnv.PASSWORD_EXPIRES),
  },
});
