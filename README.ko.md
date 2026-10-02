[English](README.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · **한국어**

# saya-themes

채팅 웹 클라이언트 [saya](https://github.com/sanguneo/saya)에서 바로 쓸 수 있는 테마 모음입니다. 테마 하나가 JSON 파일 하나이고, saya는 붙여 넣은 테마와 같은 규칙으로 검사합니다.

> **팬 메이드·비공식·비영리입니다.** 원작자나 공식 권리자와 관계가 없습니다. 「ちいかわ」 © nagano / chiikawa committee. `-img` 테마에 든 그림의 권리는 권리자에게 있습니다. [고지](#고지)를 보세요.

![saya의 테마 모음](previews/gallery-1440.png)

## 테마

캐릭터마다 `themes/<id>/`에 파일 4개가 있습니다. 라이트·다크 각각 색만 있는 판과 그림판(`-img`: 대화방 벽지, 방 목록 무늬, 마스코트, 배지, 로딩 그림)입니다. 앱의 테마 모음에는 그림판 2개가 나옵니다.

| 캐릭터 | 폴더 | 라이트 | 다크 |
| --- | --- | --- | --- |
| 우사기 | [`themes/usagi`](themes/usagi) | [미리보기](previews/usagi-light.png) | [미리보기](previews/usagi-dark.png) |
| 하치와레 | [`themes/hachiware`](themes/hachiware) | [미리보기](previews/hachiware-light.png) | [미리보기](previews/hachiware-dark.png) |
| 치이카와 | [`themes/chiikawa`](themes/chiikawa) | [미리보기](previews/chiikawa-light.png) | [미리보기](previews/chiikawa-dark.png) |
| 모몽가 | [`themes/momonga`](themes/momonga) | [미리보기](previews/momonga-light.png) | [미리보기](previews/momonga-dark.png) |
| 밤만쥬 | [`themes/kurimanju`](themes/kurimanju) | [미리보기](previews/kurimanju-light.png) | [미리보기](previews/kurimanju-dark.png) |
| 갑옷 씨(관리인) | [`themes/yoroi`](themes/yoroi) | [미리보기](previews/yoroi-light.png) | [미리보기](previews/yoroi-dark.png) |
| 유산균(むちゃうマン) | [`themes/yusangyun`](themes/yusangyun) | [미리보기](previews/yusangyun-light.png) | [미리보기](previews/yusangyun-dark.png) |

미리보기의 방과 메시지는 지어낸 것입니다.

## saya에서 고르기

테마 버튼(방 목록 머리의 반원 아이콘)을 열고 **테마 모음**까지 내립니다. 카드를 누르면 그 테마를 받아 내 테마와 같은 칸에 저장하고 바로 적용합니다. 다시 누르면 저장된 것을 덮어씁니다. 받지 못하면 아무것도 바뀌지 않고, 다시 눌러 달라는 안내가 나옵니다.

saya는 기본으로 `https://heoooooon.github.io/saya-themes/gallery.json`에서 목록을 읽습니다. 배포하는 쪽은 빌드할 때 `VITE_THEME_GALLERY_URL`로 다른 주소를 지정할 수 있고, 그 출처를 Content-Security-Policy `connect-src`에 허용해야 합니다.

## 직접 붙여넣기

1. `themes/` 아래 파일을 열고 raw로 본 뒤 전체를 복사합니다.
2. saya에서 테마 버튼 → **테마 만들기** → **테마 붙여넣기** 칸에 넣고 → **확인**.
3. 미리보기를 보고 **저장하고 적용**을 누릅니다.

그림을 지원하지 않는 saya는 `images`를 무시하고 색만 적용합니다.

## 테마 더하기

1. `themes/<id>/`에 파일 4개를 넣습니다: `<id>-light.json`, `<id>-dark.json`(색만), `<id>-light-img.json`, `<id>-dark-img.json`(그림판). 형식은 saya 테마 JSON입니다(saya의 `docs/THEMES.md`).
2. [`gallery.json`](gallery.json)에 캐릭터 한 줄을 더합니다. `name`·`mode`·`colors`는 그림판 파일 값을 그대로 옮깁니다(`colors`는 `tokens.wall`, `tokens.bubbleSelf`, `tokens.accent`, `tokens.text` 순서). `path`는 이 저장소 기준 상대 경로입니다:

   ```json
   { "id": "<id>", "name": "<캐릭터>", "themes": [{ "mode": "light", "name": "<이름>", "colors": ["<wall>", "<bubbleSelf>", "<accent>", "<text>"], "path": "themes/<id>/<id>-light-img.json" }, { "mode": "dark", "...": "..." }] }
   ```

3. [SOURCES.md](SOURCES.md)에 캐릭터와 출처를 적습니다.
4. `bun install`과 `bun scripts/validate.ts`를 돌린 뒤 풀 리퀘스트를 엽니다. CI도 같은 검사를 돌립니다.

검사는 다음을 거절합니다: saya가 거절할 테마, 대비 경고, saya가 무시할 필드, 이름·모드·색이 파일과 다른 목록 줄, 없는 파일, 어느 줄도 가리키지 않는 그림판 파일. 규칙은 saya 규칙을 그대로 복사한 것입니다(`vendor/saya`, 원본 커밋은 [vendor/saya/SOURCE.md](vendor/saya/SOURCE.md)).

무료·비영리로 나눠도 되는 그림만 넣고, 출처를 적어 주세요.

## 고지

- 이 테마들은 팬 메이드·비공식·비영리입니다. 원작자나 권리자와 관계가 없고, 승인이나 후원을 받지 않았습니다.
- 「ちいかわ」 © nagano / chiikawa committee. `-img` 테마의 모든 그림은 권리자의 것입니다.
- 출처: LINE STORE 공식 스티커 미리보기(팩 [25264193](https://store.line.me/stickershop/product/25264193/ja), [29118925](https://store.line.me/stickershop/product/29118925/ja), [32411274](https://store.line.me/stickershop/product/32411274/ja), [32367501](https://store.line.me/stickershop/product/32367501/ja), [32855985](https://store.line.me/stickershop/product/32855985/ja), [32855981](https://store.line.me/stickershop/product/32855981/ja), [33799640](https://store.line.me/stickershop/product/33799640/ja)), 공식 굿즈샵 [chiikawamarket.jp](https://chiikawamarket.jp) 상품 그림, TV 아니메 138화·175화 장면. 파일별 출처는 [SOURCES.md](SOURCES.md)에 있습니다.
- **삭제 요청:** 권리자께서 삭제를 원하시면 이 저장소에 issue를 열어 주세요. 바로 지웁니다.

## 라이선스

코드, 규칙 사본, JSON 구조는 [MIT 라이선스](LICENSE)입니다. 그림은 해당하지 않습니다. 그림의 권리는 권리자에게 있고, 이 저장소는 그림에 대한 라이선스를 주지 않습니다.
