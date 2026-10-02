[English](README.md) · [简体中文](README.zh-CN.md) · **日本語** · [한국어](README.ko.md)

# saya-themes

チャット Web クライアント [saya](https://github.com/sanguneo/saya) 用のテーマ集です。テーマは 1 つの JSON ファイルで、saya は貼り付けたテーマと同じルールでチェックします。

> **ファンメイド・非公式・非営利です。** 原作者・公式の権利者とは関係ありません。「ちいかわ」 © nagano / chiikawa committee。`-img` テーマに含まれる画像の権利は権利者にあります。[注意事項](#注意事項)をご覧ください。

![saya のテーマ集](previews/gallery-1440.png)

## テーマ

キャラクターごとに `themes/<id>/` に 4 ファイルがあります。ライトとダーク、それぞれ色だけの版と画像入りの版（`-img`：壁紙、ルーム一覧の柄、マスコット、バッジ、ローディング画像）です。アプリのテーマ集には画像入りの 2 つが出ます。

| キャラクター | フォルダ | ライト | ダーク |
| --- | --- | --- | --- |
| うさぎ | [`themes/usagi`](themes/usagi) | [プレビュー](previews/usagi-light.png) | [プレビュー](previews/usagi-dark.png) |
| ハチワレ | [`themes/hachiware`](themes/hachiware) | [プレビュー](previews/hachiware-light.png) | [プレビュー](previews/hachiware-dark.png) |
| ちいかわ | [`themes/chiikawa`](themes/chiikawa) | [プレビュー](previews/chiikawa-light.png) | [プレビュー](previews/chiikawa-dark.png) |
| モモンガ | [`themes/momonga`](themes/momonga) | [プレビュー](previews/momonga-light.png) | [プレビュー](previews/momonga-dark.png) |
| くりまんじゅう | [`themes/kurimanju`](themes/kurimanju) | [プレビュー](previews/kurimanju-light.png) | [プレビュー](previews/kurimanju-dark.png) |
| 鎧さん（管理人） | [`themes/yoroi`](themes/yoroi) | [プレビュー](previews/yoroi-light.png) | [プレビュー](previews/yoroi-dark.png) |
| むちゃうマン（乳酸菌） | [`themes/yusangyun`](themes/yusangyun) | [プレビュー](previews/yusangyun-light.png) | [プレビュー](previews/yusangyun-dark.png) |

プレビューのルームとメッセージは架空のものです。

## saya でテーマを選ぶ

テーマボタン（ルーム一覧の上にある半円のアイコン）を開き、**テーマ集**（테마 모음）までスクロールします。カードを押すとそのテーマをダウンロードし、自分のテーマと同じ場所に保存してすぐ適用します。もう一度押すと保存済みのものを上書きします。ダウンロードに失敗したときは何も変わらず、もう一度押すよう案内が出ます。

saya は既定で `https://heoooooon.github.io/saya-themes/gallery.json` から一覧を読みます。デプロイ側はビルド時に `VITE_THEME_GALLERY_URL` で別の場所を指定でき、その場合は Content-Security-Policy の `connect-src` でそのオリジンを許可する必要があります。

## 手で貼り付ける

1. `themes/` の下のファイルを開き、raw 表示にして全部コピーします。
2. saya で：テーマボタン → **テーマを作る**（테마 만들기）→ **テーマを貼り付け**（테마 붙여넣기）に貼る → **確認**（확인）。
3. プレビューを見て **保存して適用**（저장하고 적용）を押します。

画像に対応していない saya では `images` は無視され、色だけが適用されます。

## テーマを追加する

1. `themes/<id>/` に 4 ファイルを置きます：`<id>-light.json`、`<id>-dark.json`（色だけ）、`<id>-light-img.json`、`<id>-dark-img.json`（画像入り）。形式は saya のテーマ JSON（saya の `docs/THEMES.md`）です。
2. [`gallery.json`](gallery.json) にキャラクターを 1 行足します。`name`・`mode`・`colors` は画像入りファイルの値をそのまま写します（`colors` は `tokens.wall`、`tokens.bubbleSelf`、`tokens.accent`、`tokens.text` の順）。`path` はこのリポジトリからの相対パスです：

   ```json
   { "id": "<id>", "name": "<キャラクター>", "themes": [{ "mode": "light", "name": "<名前>", "colors": ["<wall>", "<bubbleSelf>", "<accent>", "<text>"], "path": "themes/<id>/<id>-light-img.json" }, { "mode": "dark", "...": "..." }] }
   ```

3. [SOURCES.md](SOURCES.md) にキャラクターと出典を書きます。
4. `bun install` と `bun scripts/validate.ts` を実行し、プルリクエストを出します。CI も同じチェックを実行します。

チェックで落ちるもの：saya が拒否するテーマ、コントラスト警告、saya が無視するフィールド、名前・モード・色がファイルと違うテーマ集の行、存在しないファイル、どの行からも指されていない画像入りファイル。ルールは saya のルールをそのまま写したものです（`vendor/saya`、元のコミットは [vendor/saya/SOURCE.md](vendor/saya/SOURCE.md)）。

無料・非営利で共有してよい画像だけを使い、出典を書いてください。

## 注意事項

- これらのテーマはファンメイド・非公式・非営利です。原作者や権利者とは関係がなく、承認や後援も受けていません。
- 「ちいかわ」 © nagano / chiikawa committee。`-img` テーマのすべての画像の権利は権利者にあります。
- 出典：LINE STORE 公式スタンプのプレビュー（パック [25264193](https://store.line.me/stickershop/product/25264193/ja)、[29118925](https://store.line.me/stickershop/product/29118925/ja)、[32411274](https://store.line.me/stickershop/product/32411274/ja)、[32367501](https://store.line.me/stickershop/product/32367501/ja)、[32855985](https://store.line.me/stickershop/product/32855985/ja)、[32855981](https://store.line.me/stickershop/product/32855981/ja)、[33799640](https://store.line.me/stickershop/product/33799640/ja)）、公式ショップ [chiikawamarket.jp](https://chiikawamarket.jp) の商品画像、TV アニメ第 138 話・第 175 話の場面。ファイルごとの出典は [SOURCES.md](SOURCES.md) にあります。
- **削除依頼：** 権利者の方で削除を希望される場合は、このリポジトリで issue を開いてください。すぐに削除します。

## ライセンス

コード、ルールの写し、JSON の構造は [MIT ライセンス](LICENSE)です。画像は対象外です。画像の権利は権利者にあり、このリポジトリは画像のライセンスを与えません。
