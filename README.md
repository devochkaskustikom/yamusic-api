# yamusic-api

[![CI](https://github.com/devochkaskustikom/yamusic-api/actions/workflows/ci.yml/badge.svg)](https://github.com/devochkaskustikom/yamusic-api/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Unofficial TypeScript SDK for Yandex Music.

The package is generated from this repository's own OpenAPI spec: typed DTOs, request builders and the
endpoint status table are produced by codegen, while resources and domain models are written by hand.
Zero runtime dependencies, native `fetch`, ESM and CJS, Node.js 20 or newer.

Read this in [Russian](RU_README.md).

## Status

- 20 operations in the spec, all typed.
- 7 operations marked `stable` after a live run against a real account:
  `account.getStatus`, `search.query`, `tracks.get`, `playlists.list`, `playlists.get`,
  `likes.tracks.list`, `likes.dislikes.list`.
- Everything else is `experimental` until it is verified on a live account. The full table is in
  [`packages/yamusic-api/docs/endpoints.md`](packages/yamusic-api/docs/endpoints.md).

## Install

The package is not published to npm yet. Build it from source:

```bash
git clone https://github.com/devochkaskustikom/yamusic-api.git
cd yamusic-api
pnpm install
pnpm build
```

Then link it into your project:

```bash
pnpm add file:../yamusic-api/packages/yamusic-api
```

## Quick start

```ts
import { YandexMusicClient } from "@dvkskustikom/yamusic-api";

const client = new YandexMusicClient({ token: process.env.YANDEX_MUSIC_TOKEN! });

const account = await client.account.me();
const found = await client.search.query("Кино", { type: "track" });
const track = await client.tracks.get(found.tracks[0]!.id);

console.log(account.login, track.title, track.artists[0]?.name);
```

`likes.tracks.list` and `likes.dislikes.list` return `LibraryTrack` entries (`id`, `albumId`,
`timestamp`): the API sends references only, so full metadata comes from `tracks.get`.

Playlist edits go through `playlists.change` with a JSON diff array; `delete` is verified live,
`insert` is still experimental.

## What is inside

- `packages/yamusic-api` - the published package.
- `packages/codegen` - spec to DTO, descriptors and docs generator.
- `spec/ym-api.yaml` - the source of truth for every endpoint.
- `examples/basic.mjs`, `examples/playlists.mjs` - runnable examples, a token is required.

Detailed usage, errors, retries, transports and limitations:
[`packages/yamusic-api/README.md`](packages/yamusic-api/README.md).

## Limitations

No audio streaming, no decryption of `encrypted` variants, no attempts to bypass subscriptions.
Tokens are never logged or written to disk by the SDK.

## Disclaimer

This is an independent, unofficial project. It is not affiliated with, endorsed by or supported by
Yandex. The Yandex Music API is undocumented and can change without notice, so no stability
guarantees are given. You are responsible for how you use your own account and token.

## License

Apache-2.0, see [LICENSE](LICENSE) and [NOTICE](packages/yamusic-api/NOTICE).
