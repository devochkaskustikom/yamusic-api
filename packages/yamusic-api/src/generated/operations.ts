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
  "likes.tracks.list": LikesTracksResponse;
  "likes.tracks.add": MutationResponse;
  "likes.tracks.remove": MutationResponse;
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
  "likes.tracks.list": { "userId": string };
  "likes.tracks.add": { "userId": string };
  "likes.tracks.remove": { "userId": string };
}

export interface OperationQueryParamsMap {
  "search.query": { "text": string; "type"?: "all" | "track" | "artist" | "album" | "playlist" | "podcast" | "video" | undefined; "page"?: number | undefined; "nocorrect"?: boolean | undefined };
  "search.suggest": { "part": string };
  "artists.getTracks": { "page"?: number | undefined; "page-size"?: number | undefined };
  "likes.tracks.add": { "track-ids": string };
  "likes.tracks.remove": { "track-ids": string };
}

export type OperationPathParams<T extends keyof OperationPathParamsMap> = OperationPathParamsMap[T];

export type OperationQueryParams<T extends keyof OperationQueryParamsMap> = OperationQueryParamsMap[T];
