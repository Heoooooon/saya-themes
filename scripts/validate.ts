/**
 * Checks every theme file with the same rules saya applies to a pasted theme
 * (vendor/saya, copied from saya — see vendor/saya/SOURCE.md), and checks that
 * gallery.json matches the files it points at.
 *
 * Run: bun scripts/validate.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseTheme } from "../vendor/saya/schema";

const root = resolve(import.meta.dir, "..");
const errors: string[] = [];
const fail = (message: string) => errors.push(message);

// 1. Every theme file: parses, no contrast warnings, no ignored tokens.
const files = Array.from(
  new Bun.Glob("themes/**/*.json").scanSync({ cwd: root }),
).sort();
if (files.length === 0) fail("no theme files under themes/");
for (const file of files) {
  const result = parseTheme(readFileSync(resolve(root, file), "utf8"));
  if (!result.ok) {
    fail(`${file}: rejected: ${JSON.stringify(result.issues)}`);
    continue;
  }
  if (result.warnings.length > 0)
    fail(`${file}: contrast warnings: ${JSON.stringify(result.warnings)}`);
  if (result.ignored.length > 0)
    fail(`${file}: ignored fields: ${JSON.stringify(result.ignored)}`);
}

// 2. gallery.json: shape, unique ids/names, each card equals its file.
type Card = {
  mode: string;
  name: string;
  colors: string[];
  path: string;
};
type Character = { id: string; name: string; themes: Card[] };

let gallery: Character[] = [];
try {
  gallery = JSON.parse(readFileSync(resolve(root, "gallery.json"), "utf8"));
  if (!Array.isArray(gallery)) throw new Error("not an array");
} catch (error) {
  fail(`gallery.json: ${(error as Error).message}`);
  gallery = [];
}

const ids = new Set<string>();
const names = new Set<string>();
const listed = new Set<string>();
for (const character of gallery) {
  const where = `gallery.json ${character?.id ?? "?"}`;
  if (typeof character?.id !== "string" || !/^[a-z0-9-]+$/.test(character.id))
    fail(`${where}: id must be lowercase letters, digits or -`);
  if (typeof character?.name !== "string" || character.name === "")
    fail(`${where}: name is missing`);
  if (ids.has(character.id)) fail(`${where}: duplicate id`);
  ids.add(character.id);
  if (!Array.isArray(character?.themes) || character.themes.length === 0) {
    fail(`${where}: themes is empty`);
    continue;
  }
  for (const card of character.themes) {
    const at = `${where} ${card?.path}`;
    if (
      typeof card?.path !== "string" ||
      !card.path.startsWith(`themes/${character.id}/`) ||
      !card.path.endsWith(".json") ||
      card.path.includes("..")
    ) {
      fail(`${at}: path must be themes/${character.id}/<file>.json`);
      continue;
    }
    if (names.has(card.name)) fail(`${at}: duplicate theme name`);
    names.add(card.name);
    listed.add(card.path);
    if (!existsSync(resolve(root, card.path))) {
      fail(`${at}: file does not exist`);
      continue;
    }
    const result = parseTheme(readFileSync(resolve(root, card.path), "utf8"));
    if (!result.ok) continue; // already reported above
    const { theme } = result;
    const expected = {
      name: theme.name,
      mode: theme.mode,
      colors: [
        theme.tokens.wall,
        theme.tokens.bubbleSelf,
        theme.tokens.accent,
        theme.tokens.text,
      ],
    };
    const shown = { name: card.name, mode: card.mode, colors: card.colors };
    if (JSON.stringify(shown) !== JSON.stringify(expected))
      fail(
        `${at}: card ${JSON.stringify(shown)} does not match the file ${JSON.stringify(expected)}`,
      );
  }
}

// 3. Every pictured theme is reachable from the gallery.
for (const file of files)
  if (file.endsWith("-img.json") && !listed.has(file))
    fail(`${file}: pictured theme is not listed in gallery.json`);

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL ${error}`);
  console.error(`${errors.length} problem(s)`);
  process.exit(1);
}
console.log(
  `OK ${files.length} theme files, ${gallery.length} characters, ${listed.size} cards`,
);
