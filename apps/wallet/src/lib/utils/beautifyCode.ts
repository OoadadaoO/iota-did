export function beautifyJsonCode(code?: string): string {
  return JSON.stringify(JSON.parse(code || "{}"), null, 2);
}
