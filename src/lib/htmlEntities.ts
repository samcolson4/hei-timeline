/** Decode common HTML entities from WordPress / JSON (e.g. &#8211; &#038;). */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: "\u00A0",
};

function codePointChar(code: number, fallback: string): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) {
    return fallback;
  }
  try {
    return String.fromCodePoint(code);
  } catch {
    return fallback;
  }
}

export function decodeHtmlEntities(input: string): string {
  let s = input.replace(/&#x([0-9a-fA-F]+);/g, (full, hex: string) => {
    return codePointChar(Number.parseInt(hex, 16), full);
  });
  s = s.replace(/&#(\d+);/g, (full, num: string) => {
    return codePointChar(Number.parseInt(num, 10), full);
  });
  s = s.replace(
    /&([a-zA-Z][a-zA-Z0-9]*);/g,
    (full, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? full,
  );
  return s;
}
