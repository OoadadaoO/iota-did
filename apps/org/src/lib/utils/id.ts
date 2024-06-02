export function Id() {
  const timestamp = ((Date.now() / 1000) | 0).toString(16);
  const rand = crypto.getRandomValues(new Uint8Array(8));
  const hexRand = Buffer.from(rand).toString("hex");
  return timestamp + hexRand;
}
