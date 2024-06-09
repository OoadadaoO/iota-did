export function utf8Tob64u(str: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64uToUtf8(base64Url: string): string {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}
