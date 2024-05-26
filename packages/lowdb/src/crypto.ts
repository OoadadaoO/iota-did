import crypto from "crypto";

export class Crypto {
  private password: string;

  constructor(password: string) {
    this.password = password;
  }

  encrypt(plain: string): string {
    const iv = crypto.randomBytes(16); // vector
    const salt = crypto.randomBytes(16); // salt
    const key = crypto.scryptSync(this.password, salt, 32); // key by salt
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    let encrypted = cipher.update(plain, "utf8", "base64url");
    encrypted += cipher.final("base64url");

    return salt.toString("hex") + ":" + iv.toString("hex") + ":" + encrypted;
  }

  decrypt(cipher: string): string {
    const [saltHex, ivHex, encrypted] = cipher.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const key = crypto.scryptSync(this.password, salt, 32);

    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted, "base64url", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
