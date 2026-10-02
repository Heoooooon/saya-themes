/**
 * The part of theming the entry bundle carries: read the stored selection and
 * draw it. Everything that parses or saves themes lives in the lazily loaded
 * sheet (store.ts, schema.ts). `public/theme-boot.js` mirrors `applyTheme`
 * before the first paint; tests/theme/boot.test.ts keeps the two equal.
 */
export const THEME_KEY = "saya.theme";
export const CUSTOM_PREFIX = "custom:";

export type BuiltinThemeId = "light" | "dark" | "kakao";
export type ThemeChoice = "system" | BuiltinThemeId | `custom:${string}`;

export type WallFit = "cover" | "tile";

/** A picture laid under a field's colour, which washes over it at `1 - opacity`. */
export interface ImageLayer {
  src: string;
  fit: WallFit;
  opacity: number;
}

/** How a loading picture moves: `dance` sways it from CSS, `none` leaves it as drawn (an animated WebP or GIF plays by itself). */
export type LoaderMotion = "dance" | "none";
export const LOADER_MOTIONS: readonly LoaderMotion[] = ["dance", "none"];

/**
 * Pictures a custom theme may carry: a wallpaper under the conversation, a
 * pattern under the room list, a mascot (the empty outlet and the list's end),
 * a small badge beside the list heading and a loader beside every loading line.
 */
export interface ThemeImages {
  wall?: ImageLayer;
  list?: ImageLayer;
  mascot?: { src: string };
  badge?: { src: string };
  loader?: { src: string; motion: LoaderMotion };
}

/** Pictures laid under a field, each named after the token of the field it sits under. */
export const IMAGE_LAYERS = ["wall", "list"] as const;
/** Pictures drawn whole, at a fixed size. */
export const IMAGE_STICKERS = ["mascot", "badge"] as const;
const LAYER_FIELD = { wall: "--field-wall", list: "--field-list" } as const;
/** The root flags the places stylesheet draws a picture under. */
const IMAGE_FLAGS = {
  list: "themeList",
  mascot: "themeMascot",
  badge: "themeBadge",
} as const;

/**
 * A picture is an inline base64 raster and nothing else: it loads no address,
 * so a theme can never make the browser fetch from anywhere, and its characters
 * cannot leave a CSS `url("…")`. `public/theme-boot.js` applies the same test.
 */
export const IMAGE_SRC =
  /^data:image\/(?:png|webp|jpeg|gif);base64,[a-z0-9+/]+={0,2}$/i;
/** Characters per picture (about 73 KB of image). */
export const IMAGE_MAX_CHARS = 100_000;
/** Characters across one theme's pictures, so twenty themes still fit in localStorage. */
export const IMAGES_MAX_CHARS = 200_000;
/** The most a wallpaper may show through the wall colour laid over it. */
export const WALL_OPACITY_MAX = 0.4;

export function isImageSrc(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= IMAGE_MAX_CHARS &&
    IMAGE_SRC.test(value)
  );
}

/** The stored selection. A custom theme carries its resolved variables so drawing it needs no parser. */
export interface StoredTheme {
  choice: ThemeChoice;
  mode?: "light" | "dark";
  vars?: Record<string, string>;
  images?: ThemeImages;
}

const BUILTIN = new Set<string>(["light", "dark", "kakao"]);

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return (
    value === "system" ||
    (typeof value === "string" &&
      (BUILTIN.has(value) ||
        (value.startsWith(CUSTOM_PREFIX) &&
          value.length > CUSTOM_PREFIX.length)))
  );
}

/**
 * What a saved theme may set: custom properties holding colours as themeVars()
 * writes them (hex and color-mix), nothing that could load a resource.
 * `public/theme-boot.js` applies the same test.
 */
const VAR_NAME = /^--[a-z0-9-]+$/;
const VAR_VALUE = /^[#a-z0-9\s(),.%-]+$/i;

function isVars(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.entries(value).every(
      ([name, v]) =>
        VAR_NAME.test(name) &&
        typeof v === "string" &&
        VAR_VALUE.test(v) &&
        !/url\s*\(/i.test(v),
    )
  );
}

/** Stored pictures that pass every rule `parseTheme` applies; anything else is dropped whole. */
function readImages(value: unknown): ThemeImages | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const raw = value as Record<string, unknown>;
  const images: ThemeImages = {};
  let chars = 0;
  for (const slot of IMAGE_LAYERS) {
    if (raw[slot] === undefined) continue;
    const layer = raw[slot] as Record<string, unknown> | null;
    if (
      !layer ||
      !isImageSrc(layer.src) ||
      (layer.fit !== "cover" && layer.fit !== "tile") ||
      typeof layer.opacity !== "number" ||
      !(layer.opacity >= 0 && layer.opacity <= WALL_OPACITY_MAX)
    )
      return undefined;
    images[slot] = { src: layer.src, fit: layer.fit, opacity: layer.opacity };
    chars += layer.src.length;
  }
  for (const slot of IMAGE_STICKERS) {
    if (raw[slot] === undefined) continue;
    const sticker = raw[slot] as Record<string, unknown> | null;
    if (!sticker || !isImageSrc(sticker.src)) return undefined;
    images[slot] = { src: sticker.src };
    chars += sticker.src.length;
  }
  if (raw.loader !== undefined) {
    const loader = raw.loader as Record<string, unknown> | null;
    if (
      !loader ||
      !isImageSrc(loader.src) ||
      !LOADER_MOTIONS.includes(loader.motion as LoaderMotion)
    )
      return undefined;
    images.loader = { src: loader.src, motion: loader.motion as LoaderMotion };
    chars += loader.src.length;
  }
  return chars > 0 && chars <= IMAGES_MAX_CHARS ? images : undefined;
}

/**
 * The custom properties that draw a theme's pictures. The wallpaper sits under
 * the wall colour at `1 - opacity`, so text on the wall keeps the contrast
 * `contrastWarnings` measured against the picture's darkest and lightest pixel.
 */
export function imageVars(images: ThemeImages | undefined) {
  const vars: Record<string, string> = {};
  for (const slot of IMAGE_LAYERS) {
    const layer = images?.[slot];
    if (!layer) continue;
    const { src, fit, opacity } = layer;
    vars[`--theme-${slot}-image`] = `url("${src}")`;
    vars[`--theme-${slot}-size`] = fit === "tile" ? "240px" : "cover";
    vars[`--theme-${slot}-repeat`] = fit === "tile" ? "repeat" : "no-repeat";
    vars[`--theme-${slot}-wash`] =
      `color-mix(in srgb, var(${LAYER_FIELD[slot]}) ${Math.round((1 - opacity) * 100)}%, transparent)`;
  }
  for (const slot of IMAGE_STICKERS) {
    const sticker = images?.[slot];
    if (sticker) vars[`--theme-${slot}`] = `url("${sticker.src}")`;
  }
  if (images?.loader) vars["--theme-loader"] = `url("${images.loader.src}")`;
  return vars;
}

/** True when a theme draws a picture the places stylesheet places: in the lists, or beside a loading line. */
export function hasPlaces(images: ThemeImages | undefined) {
  return Boolean(
    images?.list || images?.mascot || images?.badge || images?.loader,
  );
}

/** The stored selection, or "system" when nothing usable is stored. Storage may throw. */
export function readStoredTheme(
  storage: Pick<Storage, "getItem"> | null,
): StoredTheme {
  let raw: unknown = null;
  try {
    const text = storage?.getItem(THEME_KEY);
    raw = text ? JSON.parse(text) : null;
  } catch {
    raw = null;
  }
  if (!raw || typeof raw !== "object") return { choice: "system" };
  const { choice, mode, vars, images } = raw as Record<string, unknown>;
  if (!isThemeChoice(choice)) return { choice: "system" };
  if (!choice.startsWith(CUSTOM_PREFIX)) return { choice };
  if (!isVars(vars)) return { choice: "system" };
  const stored: StoredTheme = {
    choice,
    mode: mode === "dark" ? "dark" : "light",
    vars,
  };
  const pictures = readImages(images);
  if (pictures) stored.images = pictures;
  return stored;
}

/** The `data-theme` a stored selection draws under on this device. */
export function resolvedTheme(
  stored: StoredTheme,
  prefersDark: boolean,
): BuiltinThemeId | "custom" {
  if (stored.choice === "system") return prefersDark ? "dark" : "light";
  if (stored.choice.startsWith(CUSTOM_PREFIX))
    return stored.vars ? "custom" : prefersDark ? "dark" : "light";
  return stored.choice as BuiltinThemeId;
}

export interface ThemeRoot {
  dataset: DOMStringMap;
  style: Pick<CSSStyleDeclaration, "setProperty" | "removeProperty">;
}

/** Properties a custom theme set on each root, so switching away clears exactly those. */
const applied = new WeakMap<ThemeRoot, string[]>();

/** Draws a stored selection on the document root. */
export function applyTheme(
  root: ThemeRoot,
  stored: StoredTheme,
  prefersDark: boolean,
): BuiltinThemeId | "custom" {
  const theme = resolvedTheme(stored, prefersDark);
  for (const name of applied.get(root) ?? []) root.style.removeProperty(name);
  applied.delete(root);
  for (const flag of Object.values(IMAGE_FLAGS)) delete root.dataset[flag];
  delete root.dataset.themeLoader;
  if (theme === "custom" && stored.vars) {
    const names = ["color-scheme"];
    root.style.setProperty(
      "color-scheme",
      stored.mode === "dark" ? "dark" : "light",
    );
    for (const [name, value] of Object.entries(stored.vars))
      if (name.startsWith("--")) {
        root.style.setProperty(name, value);
        names.push(name);
      }
    const pictures = readImages(stored.images);
    for (const [name, value] of Object.entries(imageVars(pictures))) {
      root.style.setProperty(name, value);
      names.push(name);
    }
    for (const [slot, flag] of Object.entries(IMAGE_FLAGS))
      if (pictures?.[slot as keyof typeof IMAGE_FLAGS]) root.dataset[flag] = "";
    // The flag carries the motion, so the places stylesheet knows whether to sway it.
    if (pictures?.loader) root.dataset.themeLoader = pictures.loader.motion;
    applied.set(root, names);
  }
  root.dataset.theme = theme;
  return theme;
}
