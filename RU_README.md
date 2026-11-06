# yamusic-api

[![CI](https://github.com/devochkaskustikom/yamusic-api/actions/workflows/ci.yml/badge.svg)](https://github.com/devochkaskustikom/yamusic-api/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

Неофициальный TypeScript SDK для Яндекс Музыки.

Пакет строится из собственной OpenAPI-спеки этого репозитория: типы запросов и ответов, дескрипторы
и таблица статусов эндпоинтов генерируются, ресурсы и доменные модели написаны руками.
Ноль runtime-зависимостей, нативный `fetch`, ESM и CJS, Node.js 20 или новее.

English version: [README.md](README.md).

## Статус

- В спеке 20 операций, все типизированы.
- 7 операций помечены `stable` после живого прогона на реальном аккаунте:
  `account.getStatus`, `search.query`, `tracks.get`, `playlists.list`, `playlists.get`,
  `likes.tracks.list`, `likes.dislikes.list`.
- Остальные остаются `experimental`, пока не проверены на живом аккаунте. Полная таблица -
  [`packages/yamusic-api/docs/endpoints.md`](packages/yamusic-api/docs/endpoints.md).

## Установка

Пакет пока не опубликован в npm. Соберите его из исходников:

```bash
git clone https://github.com/devochkaskustikom/yamusic-api.git
cd yamusic-api
pnpm install
pnpm build
```

Затем подключите локально:

```bash
pnpm add file:../yamusic-api/packages/yamusic-api
```

## Быстрый старт

```ts
import { YandexMusicClient } from "@dvkskustikom/yamusic-api";

const client = new YandexMusicClient({ token: process.env.YANDEX_MUSIC_TOKEN! });

const account = await client.account.me();
const found = await client.search.query("Кино", { type: "track" });
const track = await client.tracks.get(found.tracks[0]!.id);

console.log(account.login, track.title, track.artists[0]?.name);
```

`likes.tracks.list` и `likes.dislikes.list` возвращают `LibraryTrack` (`id`, `albumId`, `timestamp`):
API отдаёт только ссылки, полные метаданные запрашиваются через `tracks.get`.

Правки плейлистов идут через `playlists.change` с JSON-массивом diff: `delete` подтверждён живым
прогоном, `insert` пока экспериментален.

## Что внутри

- `packages/yamusic-api` - сам пакет.
- `packages/codegen` - генератор DTO, дескрипторов и документации из спеки.
- `spec/ym-api.yaml` - источник правды по всем эндпоинтам.
- `examples/basic.mjs`, `examples/playlists.mjs` - рабочие примеры, нужен токен.

Подробности: ошибки, ретраи, транспорт, ограничения - в
[`packages/yamusic-api/README.md`](packages/yamusic-api/README.md).

## Ограничения

Без аудиопотока, без расшифровки `encrypted`-вариантов, без попыток обойти подписку.
Токены не попадают в логи и не пишутся на диск.

## Дисклеймер

Это независимый неофициальный проект. Он не связан с Яндексом, не одобрен и не поддерживается им.
API Яндекс Музыки недокументирован и может меняться без предупреждения, поэтому гарантий
стабильности нет. Ответственность за использование своего аккаунта и токена лежит на вас.

## Лицензия

Apache-2.0, см. [LICENSE](LICENSE) и [NOTICE](packages/yamusic-api/NOTICE).
