**English** · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md)

# saya-themes

Ready-made themes for [saya](https://github.com/sanguneo/saya), the chat web client. Each theme is one JSON file that saya checks with the same rules it applies to a theme you paste in.

> **Fan-made, unofficial, non-commercial.** These themes are not affiliated with the creators or official rights holders. 「ちいかわ」 © nagano / chiikawa committee. The pictures inside the `-img` themes belong to their rights holders; see [Notice](#notice).

![The theme gallery in saya](previews/gallery-1440.png)

## Themes

Every character has four files under `themes/<id>/`: light and dark, each with colours only and with pictures (`-img`: wallpaper, room list pattern, mascot, badge and loading picture). The app gallery shows the two pictured ones.

| Character | Folder | Light | Dark |
| --- | --- | --- | --- |
| Usagi | [`themes/usagi`](themes/usagi) | [preview](previews/usagi-light.png) | [preview](previews/usagi-dark.png) |
| Hachiware | [`themes/hachiware`](themes/hachiware) | [preview](previews/hachiware-light.png) | [preview](previews/hachiware-dark.png) |
| Chiikawa | [`themes/chiikawa`](themes/chiikawa) | [preview](previews/chiikawa-light.png) | [preview](previews/chiikawa-dark.png) |
| Momonga | [`themes/momonga`](themes/momonga) | [preview](previews/momonga-light.png) | [preview](previews/momonga-dark.png) |
| Kurimanju | [`themes/kurimanju`](themes/kurimanju) | [preview](previews/kurimanju-light.png) | [preview](previews/kurimanju-dark.png) |
| Yoroi-san (the armored caretaker) | [`themes/yoroi`](themes/yoroi) | [preview](previews/yoroi-light.png) | [preview](previews/yoroi-dark.png) |
| Muchauman (the yogurt hero) | [`themes/yusangyun`](themes/yusangyun) | [preview](previews/yusangyun-light.png) | [preview](previews/yusangyun-dark.png) |
| Shisa (the ramen-shop helper) | [`themes/shisa`](themes/shisa) | [preview](previews/shisa-light.png) | [preview](previews/shisa-dark.png) |
| Halloween (October 1–November 7, 2026, KST) | [`themes/halloween`](themes/halloween) | [preview](previews/halloween-light.png) | [preview](previews/halloween-dark.png) |

Previews use made-up rooms and messages.

Seasonal gallery entries may have optional `from` and `until` dates in `yyyy-MM-dd` format. Both dates are inclusive, using Korea Standard Time (KST). A missing bound is open-ended; without either field, the entry is available all year. Clients that support seasonal filtering hide entries outside the period or with malformed dates. CI rejects invalid calendar dates and reversed periods.

## Pick a theme in saya

Open the theme button (the half-circle icon at the top of the room list) and scroll to **Theme gallery** (테마 모음). Pressing a card downloads that theme, saves it next to your own themes and applies it. Pressing it again replaces the saved copy. If the download fails, nothing changes and the sheet tells you to try again.

saya reads the list from `https://heoooooon.github.io/saya-themes/gallery.json` by default. A deployment can point it elsewhere with `VITE_THEME_GALLERY_URL` at build time, and its Content-Security-Policy must allow that origin in `connect-src`.

## Paste a theme by hand

1. Open a file under `themes/`, view it raw and copy all of it.
2. In saya: theme button → **Make a theme** (테마 만들기) → paste into **Paste a theme** (테마 붙여넣기) → **Check** (확인).
3. Look at the preview and press **Save and apply** (저장하고 적용).

A saya without picture support ignores `images` and applies the colours only.

## Add a theme

1. Put four files in `themes/<id>/`: `<id>-light.json`, `<id>-dark.json` (colours only), `<id>-light-img.json`, `<id>-dark-img.json` (with pictures). The format is saya's theme JSON (`docs/THEMES.md` in saya).
2. Add one line for the character to [`gallery.json`](gallery.json). Copy `name`, `mode` and `colors` from the pictured file (`colors` is `tokens.wall`, `tokens.bubbleSelf`, `tokens.accent`, `tokens.text`, in that order). `path` is relative to this repository:

   ```json
   { "id": "<id>", "name": "<character>", "themes": [{ "mode": "light", "name": "<name>", "colors": ["<wall>", "<bubbleSelf>", "<accent>", "<text>"], "path": "themes/<id>/<id>-light-img.json" }, { "mode": "dark", "...": "..." }] }
   ```

3. Add the character and its sources to [SOURCES.md](SOURCES.md).
4. Run `bun install` and `bun scripts/validate.ts`, then open a pull request. CI runs the same check.

The check rejects a theme saya would reject, any contrast warning, any field saya would ignore, a gallery line whose name, mode or colours differ from its file, a missing file, and a pictured file that no gallery line points at. The rules are an unmodified copy of saya's (`vendor/saya`, source commit in [vendor/saya/SOURCE.md](vendor/saya/SOURCE.md)).

Only add pictures you may share for free, non-commercial use, and name where they came from.

## Notice

- These themes are fan-made, unofficial and non-commercial. They are not affiliated with, endorsed by or sponsored by the creators or rights holders.
- 「ちいかわ」 © nagano / chiikawa committee. All pictures in the `-img` themes belong to their rights holders.
- Sources: official LINE STORE sticker previews (packs [25264193](https://store.line.me/stickershop/product/25264193/ja), [29118925](https://store.line.me/stickershop/product/29118925/ja), [32411274](https://store.line.me/stickershop/product/32411274/ja), [32367501](https://store.line.me/stickershop/product/32367501/ja), [32855985](https://store.line.me/stickershop/product/32855985/ja), [32855981](https://store.line.me/stickershop/product/32855981/ja), [33799640](https://store.line.me/stickershop/product/33799640/ja)), product pictures from the official shop [chiikawamarket.jp](https://chiikawamarket.jp), and frames from the TV anime episodes 138 and 175. Per-file details are in [SOURCES.md](SOURCES.md).
- **Takedown:** if you hold rights to any of this material and want it removed, open an issue in this repository. It will be removed right away, without discussion.

## License

The code, the schema copy and the JSON structure are under the [MIT License](LICENSE). The pictures are not: they belong to their rights holders and are not licensed by this repository.
