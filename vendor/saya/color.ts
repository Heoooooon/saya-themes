/** sRGB colour arithmetic for theme tokens: parsing, mixing and WCAG 2.1 contrast. */

export type Rgb = readonly [number, number, number];

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

/** `#abc` and `#aabbcc` to channels; throws on anything else. */
export function parseHex(value: string): Rgb {
  if (!HEX.test(value)) throw new Error(`Not a hex colour: ${value}`);
  const digits =
    value.length === 4
      ? [...value.slice(1)].map((digit) => digit + digit).join("")
      : value.slice(1);
  return [0, 2, 4].map((at) =>
    Number.parseInt(digits.slice(at, at + 2), 16),
  ) as unknown as Rgb;
}

export function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((channel) =>
      Math.round(Math.min(255, Math.max(0, channel)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Lower-case six-digit form, so equal colours compare equal. */
export function normalizeHex(value: string): string {
  return toHex(parseHex(value));
}

/** CSS `color-mix(in srgb, a <weight*100>%, b)` for opaque colours. */
export function mix(a: string, b: string, weight: number): string {
  const [x, y] = [parseHex(a), parseHex(b)];
  return toHex(
    [0, 1, 2].map(
      (i) => (x[i] ?? 0) * weight + (y[i] ?? 0) * (1 - weight),
    ) as unknown as Rgb,
  );
}

function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 relative luminance. */
export function luminance(value: string): number {
  const [r, g, b] = parseHex(value);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2.1 contrast ratio, 1 to 21, order-independent. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}
