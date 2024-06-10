export function beautifyJsonCode(code?: string): string {
  return JSON.stringify(JSON.parse(code || "{}"), null, 2);
}
export function beautifyJson(json?: any): string {
  return JSON.stringify(json || {}, null, 2);
}
