export function prettyJson(o: any) {
  return JSON.stringify(o, null, 2).replace(/"/g, "'");
}
