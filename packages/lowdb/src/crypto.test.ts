import { Crypto } from "./crypto";

const text = "Hello, world. This is a test message.";
const password = "MySuperSecretPassword";

const crypto = new Crypto(password);

const encryptedText = crypto.encrypt(text);
console.log("Encrypted:", encryptedText);

const decryptedText = crypto.decrypt(encryptedText);
console.log("Decrypted:", decryptedText);
