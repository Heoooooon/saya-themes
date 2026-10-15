/**
 * Draws one card preview per theme listed in gallery.json —
 * previews/cards/<characterId>-<mode>.svg — from the theme's own tokens and
 * its mascot picture, and writes `preview` on each card in gallery.json.
 * Nothing is drawn by hand: a newly added theme gets its card by running this
 * again. The SVG has no <text>, because fonts are not available inside an
 * <img>-loaded SVG; words are rounded bars.
 *
 * Run: bun scripts/build-previews.ts
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { contrastRatio } from "../vendor/saya/color";
import {
  parseTheme,
  resolveTokens,
  type ThemeDefinition,
} from "../vendor/saya/schema";

const root = resolve(import.meta.dir, "..");
const CARDS_DIR = "previews/cards";
const WIDTH = 320;
const HEIGHT = 200;
const STRIP = 28;
const RADIUS = 12;
const BAR = 4;
/** The mascot is kept inside this box, bottom-right, above the input strip. */
const MASCOT = { x: 204, y: 84, width: 104, height: 84 };
const MASCOT_MAX = 160;

type Card = { mode: string; name: string; colors: string[]; path: string };
type Character = { id: string; themes: Card[] };

const bar = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  opacity: number,
) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${BAR}" fill="${fill}" fill-opacity="${opacity}"/>`;

const bubble = (
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
) =>
  `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${RADIUS}" fill="${fill}"/>`;

/** The mascot, downscaled when Bun.Image is available; otherwise the file's own data URI. */
async function mascotSource(theme: ThemeDefinition): Promise<string | null> {
  const picture =
    theme.images?.mascot ?? theme.images?.badge ?? theme.images?.loader;
  if (!picture) return null;
  const Image = (Bun as unknown as { Image?: new (data: Uint8Array) => unknown })
    .Image;
  if (typeof Image !== "function") return picture.src;
  const [, base64 = ""] = picture.src.split(",", 2);
  const bytes = Buffer.from(base64, "base64");
  const image = new Image(new Uint8Array(bytes)) as {
    resize(
      width: number,
      height: number,
      options: { fit: "inside" },
    ): { webp(options: { quality: number }): { toBase64(): Promise<string> } };
  };
  const encoded = await image
    .resize(MASCOT_MAX, MASCOT_MAX, { fit: "inside" })
    .webp({ quality: 80 })
    .toBase64();
  return `data:image/webp;base64,${encoded}`;
}

/** The room's dot on the header: the first of these that stands out from it. */
const headerDot = (t: Record<string, string>) =>
  [t.listSelected, t.rule, t.accent, t.text].find(
    (colour) => colour !== undefined && contrastRatio(colour, t.header) >= 1.5,
  ) ?? t.text;

async function drawCard(theme: ThemeDefinition): Promise<string> {
  const t = resolveTokens(theme);
  const mascot = await mascotSource(theme);
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">`,
    `<rect width="${WIDTH}" height="${HEIGHT}" fill="${t.wall}"/>`,
    // Header: the room's dot and its name.
    `<rect width="${WIDTH}" height="${STRIP}" fill="${t.header}"/>`,
    `<circle cx="18" cy="14" r="7" fill="${headerDot(t)}"/>`,
    bar(32, 10, 72, 8, t.text, 0.8),
    // Mine, top right, so it never sits on the mascot below it.
    bubble(178, 38, 130, 36, t.bubbleSelf),
    bar(190, 47, 96, 7, t.bubbleSelfText, 0.55),
    bar(190, 59, 64, 7, t.bubbleSelfText, 0.55),
    // Theirs, left, two lines then a short one.
    bubble(12, 82, 130, 36, t.bubbleOther),
    bar(24, 91, 88, 7, t.bubbleOtherText, 0.55),
    bar(24, 103, 56, 7, t.bubbleOtherText, 0.55),
    bubble(12, 126, 96, 28, t.bubbleOther),
    bar(24, 136, 64, 8, t.bubbleOtherText, 0.55),
  ];
  if (mascot)
    parts.push(
      `<image x="${MASCOT.x}" y="${MASCOT.y}" width="${MASCOT.width}" height="${MASCOT.height}" preserveAspectRatio="xMidYMax meet" href="${mascot}"/>`,
    );
  parts.push(
    // Input strip: the box, a placeholder bar and the send button.
    `<rect y="${HEIGHT - STRIP}" width="${WIDTH}" height="${STRIP}" fill="${t.input}"/>`,
    bar(12, HEIGHT - STRIP + 10, 180, 8, t.textMuted, 0.5),
    `<circle cx="300" cy="${HEIGHT - STRIP / 2}" r="9" fill="${t.accent}"/>`,
    "</svg>",
  );
  return `${parts.join("\n")}\n`;
}

async function main() {
  const galleryPath = resolve(root, "gallery.json");
  let text = readFileSync(galleryPath, "utf8");
  const gallery = JSON.parse(text) as Character[];
  mkdirSync(resolve(root, CARDS_DIR), { recursive: true });
  let count = 0;
  let resized = false;
  for (const character of gallery) {
    for (const card of character.themes) {
      const result = parseTheme(readFileSync(resolve(root, card.path), "utf8"));
      if (!result.ok)
        throw new Error(`${card.path}: ${JSON.stringify(result.issues)}`);
      const file = `${CARDS_DIR}/${character.id}-${card.mode}.svg`;
      const svg = await drawCard(result.theme);
      writeFileSync(resolve(root, file), svg);
      resized ||= svg.includes('href="data:image/webp');
      count += 1;
      // Keep the file's one-line-per-character layout and each line's own
      // spacing: only the card's `preview` member changes, right after `path`.
      const previous = new RegExp(
        `("path":)(\\s*)(${JSON.stringify(card.path).replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")})(,\\s*"preview":\\s*"[^"]*")?`,
      );
      if (!previous.test(text))
        throw new Error(`gallery.json: cannot find the card for ${card.path}`);
      text = text.replace(
        previous,
        (_, key: string, space: string, path: string) =>
          `${key}${space}${path},${space}"preview":${space}${JSON.stringify(file)}`,
      );
    }
  }
  writeFileSync(galleryPath, text);
  console.log(
    `OK ${count} cards in ${CARDS_DIR}/ (${resized ? "mascots downscaled with Bun.Image" : "mascots embedded as-is"})`,
  );
}

await main();
