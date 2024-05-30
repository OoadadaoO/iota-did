import { env } from "./env";
import { initializeWallet } from "./utils";

await initializeWallet(env.TEST_STORAGE_PATH, env.TEST_PASSWORD);
