# Статус эндпоинтов

Файл генерируется из `spec/ym-api.yaml`. Правки вручную перезаписываются.

| Статус | Значение |
| --- | --- |
| `stable` | Проверен на живом API владельцем пакета |
| `experimental` | Реализован, но проверен не на всех аккаунтах |
| `restricted` | Требует определённых прав или подписки |
| `deprecated` | Устарел |
| `unavailable` | Сервер больше не предоставляет возможность |

## account

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `account.getStatus` | `GET /account/status` | да | `experimental` |
| `account.getSettings` | `GET /account/settings` | да | `experimental` |

## search

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `search.query` | `GET /search` | да | `experimental` |
| `search.suggest` | `GET /search/suggest` | да | `experimental` |

## tracks

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `tracks.get` | `GET /tracks/{trackId}` | да | `experimental` |
| `tracks.getLyrics` | `GET /tracks/{trackId}/lyrics` | да | `experimental` |
| `tracks.getSimilar` | `GET /tracks/{trackId}/similar` | да | `experimental` |

## albums

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `albums.get` | `GET /albums/{albumId}` | да | `experimental` |
| `albums.getWithTracks` | `GET /albums/{albumId}/with-tracks` | да | `experimental` |

## artists

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `artists.get` | `GET /artists/{artistId}` | да | `experimental` |
| `artists.getTracks` | `GET /artists/{artistId}/tracks` | да | `experimental` |

## playlists

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `playlists.list` | `GET /users/{userId}/playlists` | да | `experimental` |
| `playlists.get` | `GET /users/{userId}/playlists/{kind}` | да | `experimental` |
| `playlists.change` | `POST /users/{userId}/playlists/{kind}/change` | нет | `experimental` |

## likes

| Операция | Запрос | Повторяемая | Статус |
| --- | --- | --- | --- |
| `likes.tracks.list` | `GET /users/{userId}/likes/tracks` | да | `experimental` |
| `likes.tracks.add` | `POST /users/{userId}/likes/tracks/add-multiple` | нет | `experimental` |
| `likes.tracks.remove` | `POST /users/{userId}/likes/tracks/remove` | нет | `experimental` |
| `likes.dislikes.list` | `GET /users/{userId}/likes/dislikes` | да | `experimental` |
| `likes.dislikes.add` | `POST /users/{userId}/likes/dislikes/add` | нет | `experimental` |
| `likes.dislikes.remove` | `POST /users/{userId}/likes/dislikes/remove` | нет | `experimental` |

