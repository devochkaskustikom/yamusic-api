# @dvkskustikom/yamusic-api

Неофициальный TypeScript SDK для Яндекс Музыки: типизированный доступ к подтверждённым
эндпоинтам, нормализованные модели и предсказуемое поведение при сбоях.

> **Это независимая реализация.** Проект не связан с Яндексом, не поддерживается им и не
> использует публичный документированный API. Серверные интерфейсы восстановлены по
> наблюдаемому поведению и могут измениться без предупреждения. Никаких гарантий
> работоспособности конкретных эндпоинтов не даётся: актуальный статус каждого метода —
> в [таблице статусов](docs/endpoints.md).

## Установка

```bash
npm install @dvkskustikom/yamusic-api
```

- Node.js ≥ 20 (нужен встроенный `fetch`);
- ESM и CommonJS;
- ноль runtime-зависимостей.

## Быстрый старт

```ts
import { YandexMusicClient } from "@dvkskustikom/yamusic-api";

const client = new YandexMusicClient({
  token: process.env.YANDEX_MUSIC_TOKEN,
});

const account = await client.account.me();
console.log(account.displayName, account.plus?.hasPlus);

const result = await client.search.query("Кино", { type: "track" });
console.log(result.totals.tracks, result.tracks[0]?.title);

const track = await client.tracks.get(result.tracks[0]!.id);
const album = await client.albums.get(track.albums[0]!.id, { withTracks: true });
const lyrics = await client.tracks.getLyrics(track.id);

const playlist = await client.playlists.get(3);
await client.likes.tracks.add(track.id);
```

## Авторизация

Токен — единственное, что нужно. Библиотека не пишет токены на диск, не логирует их и не
подставляет заголовок `Authorization` в тексты ошибок.

```ts
// 1. Готовый токен
new YandexMusicClient({ token: "..." });

// 2. Асинхронный источник (например, хранилище приложения)
new YandexMusicClient({
  auth: {
    getToken: async () => tokenStorage.getAccessToken(),
  },
});

// 3. Собственный провайдер с инвалидацией при 401
new YandexMusicClient({
  auth: {
    provider: {
      getToken: () => keychain.read(),
      invalidate: () => keychain.clear(),
    },
  },
});
```

Токен кешируется в памяти, сбрасывается при ответе `401` и запрашивается заново. Хранение
токена — ответственность приложения.

### Device Flow

OAuth-клиент нужно зарегистрировать самостоятельно: библиотека не содержит чужих
`client_id` и `client_secret`.

```ts
import { DeviceFlowAuth } from "@dvkskustikom/yamusic-api";

const deviceFlow = new DeviceFlowAuth({ clientId: process.env.YANDEX_CLIENT_ID! });
const code = await deviceFlow.startDeviceFlow();

console.log(`Откройте ${code.verificationUrl} и введите код ${code.userCode}`);

const token = await deviceFlow.waitForToken(code.deviceCode);
```

## Идентификаторы и ссылки

Везде, где метод принимает `Ref`, можно передать число, строку с числом или ссылку:

```ts
await client.tracks.get(456);
await client.tracks.get("456");
await client.tracks.get("https://music.yandex.ru/album/123/track/456");
await client.playlists.get("https://music.yandex.ru/users/login/playlists/3");
```

Отдельные утилиты, если разбор нужен самостоятельно:

```ts
import { parseYandexUrl, getTrackId, getCoverUrl } from "@dvkskustikom/yamusic-api";

parseYandexUrl("https://music.yandex.ru/artist/789"); // { type: "artist", artistId: 789 }
getTrackId("https://music.yandex.ru/track/456");      // 456
getCoverUrl("avatars.yandex.net/get-music-content/1/2/%%", "1000x1000");
```

Поддерживаются домены `music.yandex.ru`, `.com`, `.by`, `.kz`, `.uz`, `.com.tr`, `.co.il`.
Ссылка на посторонний домен даёт `InvalidReferenceError`, а не тихую попытку запроса.

## Модели

Модели — обычные сериализуемые объекты. Внутри нет ссылки на клиент, поэтому их можно
без опасок отдавать в `JSON.stringify`, кешировать и передавать между процессами.

```ts
interface Track {
  id: number;
  title: string;
  artists: ArtistRef[];
  albums: AlbumRef[];
  durationMs?: number;
  coverUri?: string;   // исходный uri из API
  coverUrl?: string;   // готовый https-URL, 400x400
  available?: boolean;
  explicit?: boolean;
}
```

Неизвестные поля ответа не теряются: они сохраняются в неперечисляемом свойстве
`Symbol.for("ym:raw")` и не попадают в JSON.

## Ошибки

```ts
import {
  NotFoundError,
  RateLimitError,
  UnauthorizedError,
  isYandexMusicError,
} from "@dvkskustikom/yamusic-api";

try {
  await client.tracks.get(456);
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // токен недействителен, нужен повторный вход
  } else if (error instanceof RateLimitError) {
    console.log(error.retryAfterMs);
  } else if (error instanceof NotFoundError) {
    console.log(error.status, error.requestId);
  } else if (isYandexMusicError(error)) {
    console.log(error.code, error.endpoint);
  }
}
```

Иерархия: `YandexMusicError` → `AuthenticationError`, `ForbiddenError`, `NotFoundError`,
`RateLimitError`, `ApiError`, `NetworkError`, `SchemaMismatchError`, `InvalidReferenceError`.
У ошибки всегда есть `code`, а при наличии — `status`, `endpoint`, `requestId`,
`retryAfterMs` и `cause`.

## Транспорт

```ts
const client = new YandexMusicClient({
  token: "...",
  transport: {
    timeoutMs: 10_000,
    retries: 2,
    retry: { baseDelayMs: 300, maxDelayMs: 10_000 },
    retryOnStatus: [408, 429, 500, 502, 503, 504],
    rateLimit: { capacity: 20, intervalMs: 1_000 },
  },
});
```

- повторяются только идемпотентные операции (это зафиксировано в спеке, а не в коде);
- `429` уважает `Retry-After` (секунды и HTTP-дату);
- лимитер (token bucket) включён по умолчанию, отключается через `rateLimit: null`;
- `AbortSignal` поддерживается на каждом методе;
- при `401` кеш токена сбрасывается автоматически.

## Отслеживание изменений API

API неофициальный, поэтому расхождения схемы обнаруживаются в рантайме:

```ts
const client = new YandexMusicClient({
  token: "...",
  debug: {
    detectUnknownFields: true,
    onSchemaChange(change) {
      console.warn(change.operationId, change.kind, change.path);
    },
  },
});
```

Появление нового поля не ломает библиотеку: это событие `unknown-field`, а не исключение.
Проверка выключена по умолчанию, потому что обход ответа стоит времени.

## Доступ к непокрытым эндпоинтам

```ts
const data = await client.raw.request("/some/api/endpoint", {
  query: { page: 1 },
});
```

Метод `raw` повторяется только для `GET`; для остальных методов повтор нужно включать
осознанно, так как идемпотентности на стороне API нет.

## Статусы эндпоинтов

[`docs/endpoints.md`](docs/endpoints.md) генерируется из спецификации вместе с кодом, поэтому
не может разойтись с реализацией. Пока ни один метод не проверен на живом API в рамках этого
репозитория, все статусы — `experimental`.

## Осознанные ограничения

- **Нет получения аудиопотока, расшифровки защищённых вариантов и обхода подписки.**
  SDK работает с метаданными и пользовательскими коллекциями.
- **Нет браузерной сборки.** Токен в браузере — отдельная модель угроз и CORS; обещать
  «работает в браузере» без этой проработки нельзя.
- **Нет мутаций плейлистов** в этой версии: сначала фиксируется контракт, потом
  добавляются операции изменения.
- **Нет автоматических запросов к живому API в тестах.** Все тесты работают на моках.

## Условия использования сервиса

Сервис Яндекс Музыка предназначен для личного некоммерческого использования, а его
условия могут меняться без предварительного уведомления. Использование SDK не даёт прав на
контент и не отменяет эти условия: ответственность за использование несёт приложение,
которое применяет библиотеку. Для коммерческих сценариев нужна отдельная правовая проверка.

## Разработка

```bash
pnpm install
pnpm codegen        # спецификация → типы, дескрипторы, shapes, таблица статусов
pnpm typecheck
pnpm test
pnpm build
```

Спецификация `spec/ym-api.yaml` — источник правды. Файлы в `src/generated` и
`docs/endpoints.md` правятся только генератором; `pnpm check:codegen` перегенерирует код и
падает, если результат разошёлся с закоммиченным.

## Лицензия

Apache-2.0, полный текст — в файле [`LICENSE`](LICENSE), сведения об авторстве — в
[`NOTICE`](NOTICE). Код библиотеки написан с нуля, исходники LGPL-проектов не
копировались.

Лицензия распространяется на код SDK, но не на контент и сервисы Яндекса. Товарные знаки
«Яндекс» и «Яндекс Музыка» не используются как обозначение происхождения пакета: библиотека
независимая и неофициальная.
