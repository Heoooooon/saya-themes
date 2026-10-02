# vendor/saya

`schema.ts`, `apply.ts` and `color.ts` are unmodified copies of
`src/features/theme/` from saya (https://github.com/sanguneo/saya), so the
checks here are the same ones the app runs on a pasted or gallery theme.

- Source commit: `a8b06dfbb4faed23f7f6b95c367c9116ec2eee18`
  (`feat(theme): a theme's loader dances beside every loading line`)
- License: MIT, see [LICENSE](LICENSE) (saya's license, kept with the copy).

To refresh after saya changes its theme rules:

```sh
for f in schema apply color; do cp <saya>/src/features/theme/$f.ts vendor/saya/$f.ts; done
git -C <saya> log -1 --format=%H -- src/features/theme/schema.ts src/features/theme/apply.ts src/features/theme/color.ts
```

then put that commit above and run `bun scripts/validate.ts`.
