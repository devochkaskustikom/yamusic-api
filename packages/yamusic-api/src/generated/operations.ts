// AUTO-GENERATED FROM spec/ym-api.yaml BY packages/codegen.
// Manual edits are overwritten by `pnpm codegen`. Edit the spec instead.

import type {
  AccountStatusResponse,
  AlbumResponse,
  ArtistResponse,
  ArtistTracksResponse,
  LikesTracksResponse,
  LyricsResponse,
  MutationResponse,
  PlaylistDiff,
  PlaylistResponse,
  PlaylistsResponse,
  SearchResponse,
  SimilarTracksResponse,
  SuggestResponse,
  TracksResponse,
} from "./dto.js";


export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type EndpointStatus = "stable" | "experimental" | "restricted" | "deprecated" | "unavailable";

export interface OperationDescriptorSpec {
  readonly method: HttpMethod;
  readonly path: string;
  readonly tag: string;
  readonly idempotent: boolean;
  readonly status: EndpointStatus;
  readonly pathParams: readonly string[];
  readonly queryParams: readonly string[];
  readonly requestBodySchema: string | null;
  readonly responseSchema: string | null;
}

export const operations = {
  "account.getStatus": {
  "method": "GET",
  "path": "/account/status",
  "tag": "account",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "AccountStatusResponse"
} as const,
  "account.getSettings": {
  "method": "GET",
  "path": "/account/settings",
  "tag": "account",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": null
} as const,
  "search.query": {
  "method": "GET",
  "path": "/search",
  "tag": "search",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [],
  "queryParams": [
    "text",
    "type",
    "page",
    "nocorrect"
  ],
  "requestBodySchema": null,
  "responseSchema": "SearchResponse"
} as const,
  "search.suggest": {
  "method": "GET",
  "path": "/search/suggest",
  "tag": "search",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [],
  "queryParams": [
    "part"
  ],
  "requestBodySchema": null,
  "responseSchema": "SuggestResponse"
} as const,
  "tracks.get": {
  "method": "GET",
  "path": "/tracks/{trackId}",
  "tag": "tracks",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "trackId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "TracksResponse"
} as const,
  "tracks.getLyrics": {
  "method": "GET",
  "path": "/tracks/{trackId}/lyrics",
  "tag": "tracks",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "trackId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "LyricsResponse"
} as const,
  "tracks.getSimilar": {
  "method": "GET",
  "path": "/tracks/{trackId}/similar",
  "tag": "tracks",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "trackId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "SimilarTracksResponse"
} as const,
  "albums.get": {
  "method": "GET",
  "path": "/albums/{albumId}",
  "tag": "albums",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "albumId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "AlbumResponse"
} as const,
  "albums.getWithTracks": {
  "method": "GET",
  "path": "/albums/{albumId}/with-tracks",
  "tag": "albums",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "albumId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "AlbumResponse"
} as const,
  "artists.get": {
  "method": "GET",
  "path": "/artists/{artistId}",
  "tag": "artists",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "artistId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "ArtistResponse"
} as const,
  "artists.getTracks": {
  "method": "GET",
  "path": "/artists/{artistId}/tracks",
  "tag": "artists",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "artistId"
  ],
  "queryParams": [
    "page",
    "page-size"
  ],
  "requestBodySchema": null,
  "responseSchema": "ArtistTracksResponse"
} as const,
  "playlists.list": {
  "method": "GET",
  "path": "/users/{userId}/playlists",
  "tag": "playlists",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "PlaylistsResponse"
} as const,
  "playlists.get": {
  "method": "GET",
  "path": "/users/{userId}/playlists/{kind}",
  "tag": "playlists",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "userId",
    "kind"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "PlaylistResponse"
} as const,
  "playlists.change": {
  "method": "POST",
  "path": "/users/{userId}/playlists/{kind}/change",
  "tag": "playlists",
  "idempotent": false,
  "status": "experimental",
  "pathParams": [
    "userId",
    "kind"
  ],
  "queryParams": [
    "revision"
  ],
  "requestBodySchema": "PlaylistDiff",
  "responseSchema": "PlaylistResponse"
} as const,
  "likes.tracks.list": {
  "method": "GET",
  "path": "/users/{userId}/likes/tracks",
  "tag": "likes",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "LikesTracksResponse"
} as const,
  "likes.tracks.add": {
  "method": "POST",
  "path": "/users/{userId}/likes/tracks/add-multiple",
  "tag": "likes",
  "idempotent": false,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [
    "track-ids"
  ],
  "requestBodySchema": null,
  "responseSchema": "MutationResponse"
} as const,
  "likes.tracks.remove": {
  "method": "POST",
  "path": "/users/{userId}/likes/tracks/remove",
  "tag": "likes",
  "idempotent": false,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [
    "track-ids"
  ],
  "requestBodySchema": null,
  "responseSchema": "MutationResponse"
} as const,
  "likes.dislikes.list": {
  "method": "GET",
  "path": "/users/{userId}/likes/dislikes",
  "tag": "likes",
  "idempotent": true,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [],
  "requestBodySchema": null,
  "responseSchema": "LikesTracksResponse"
} as const,
  "likes.dislikes.add": {
  "method": "POST",
  "path": "/users/{userId}/likes/dislikes/add",
  "tag": "likes",
  "idempotent": false,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [
    "track-ids"
  ],
  "requestBodySchema": null,
  "responseSchema": "MutationResponse"
} as const,
  "likes.dislikes.remove": {
  "method": "POST",
  "path": "/users/{userId}/likes/dislikes/remove",
  "tag": "likes",
  "idempotent": false,
  "status": "experimental",
  "pathParams": [
    "userId"
  ],
  "queryParams": [
    "track-ids"
  ],
  "requestBodySchema": null,
  "responseSchema": "MutationResponse"
} as const,
} as const satisfies Record<string, OperationDescriptorSpec>;

export type OperationId = keyof typeof operations;

export interface OperationResponseMap {
  "account.getStatus": AccountStatusResponse;
  "account.getSettings": Record<string, unknown>;
  "search.query": SearchResponse;
  "search.suggest": SuggestResponse;
  "tracks.get": TracksResponse;
  "tracks.getLyrics": LyricsResponse;
  "tracks.getSimilar": SimilarTracksResponse;
  "albums.get": AlbumResponse;
  "albums.getWithTracks": AlbumResponse;
  "artists.get": ArtistResponse;
  "artists.getTracks": ArtistTracksResponse;
  "playlists.list": PlaylistsResponse;
  "playlists.get": PlaylistResponse;
  "playlists.change": PlaylistResponse;
  "likes.tracks.list": LikesTracksResponse;
  "likes.tracks.add": MutationResponse;
  "likes.tracks.remove": MutationResponse;
  "likes.dislikes.list": LikesTracksResponse;
  "likes.dislikes.add": MutationResponse;
  "likes.dislikes.remove": MutationResponse;
}

export type OperationResponse<T extends OperationId> = OperationResponseMap[T];

export interface OperationPathParamsMap {
  "tracks.get": { "trackId": number };
  "tracks.getLyrics": { "trackId": number };
  "tracks.getSimilar": { "trackId": number };
  "albums.get": { "albumId": number };
  "albums.getWithTracks": { "albumId": number };
  "artists.get": { "artistId": number };
  "artists.getTracks": { "artistId": number };
  "playlists.list": { "userId": string };
  "playlists.get": { "userId": string; "kind": number };
  "playlists.change": { "userId": string; "kind": number };
  "likes.tracks.list": { "userId": string };
  "likes.tracks.add": { "userId": string };
  "likes.tracks.remove": { "userId": string };
  "likes.dislikes.list": { "userId": string };
  "likes.dislikes.add": { "userId": string };
  "likes.dislikes.remove": { "userId": string };
}

export interface OperationQueryParamsMap {
  "search.query": { "text": string; "type"?: "all" | "track" | "artist" | "album" | "playlist" | "podcast" | "video" | undefined; "page"?: number | undefined; "nocorrect"?: boolean | undefined };
  "search.suggest": { "part": string };
  "artists.getTracks": { "page"?: number | undefined; "page-size"?: number | undefined };
  "playlists.change": { "revision": number };
  "likes.tracks.add": { "track-ids": string };
  "likes.tracks.remove": { "track-ids": string };
  "likes.dislikes.add": { "track-ids": string };
  "likes.dislikes.remove": { "track-ids": string };
}

export type OperationPathParams<T extends keyof OperationPathParamsMap> = OperationPathParamsMap[T];

export type OperationQueryParams<T extends keyof OperationQueryParamsMap> = OperationQueryParamsMap[T];

export interface OperationBodyMap {
  "playlists.change": PlaylistDiff;
}

export type OperationBody<T extends OperationId> = T extends keyof OperationBodyMap ? OperationBodyMap[T] : never;
