// AUTO-GENERATED FROM spec/ym-api.yaml BY packages/codegen.
// Manual edits are overwritten by `pnpm codegen`. Edit the spec instead.
export interface InvocationInfo {
  "req-id"?: string;
  "hostname"?: string;
}

export interface Account {
  "now"?: string;
  "uid": number;
  "login"?: string;
  "fullName"?: string;
  "firstName"?: string;
  "secondName"?: string;
  "displayName"?: string;
  "serviceAvailable"?: boolean;
  "hostedUser"?: boolean;
}

export interface Plus {
  "hasPlus"?: boolean;
  "isTutorialCompleted"?: boolean;
  "migrationCompleted"?: boolean;
}

export interface AccountStatusResult {
  "account": Account;
  "defaultEmail"?: string;
  "plus"?: Plus;
}

export interface AccountStatusResponse {
  "invocationInfo"?: InvocationInfo;
  "result": AccountStatusResult;
}

export interface ArtistCover {
  "type"?: string;
  "uri"?: string;
}

export interface ArtistCounts {
  "tracks"?: number;
  "directAlbums"?: number;
  "alsoAlbums"?: number;
  "alsoTracks"?: number;
}

export interface ArtistRatings {
  "month"?: number;
  "week"?: number;
  "day"?: number;
}

export interface ArtistLink {
  "title"?: string;
  "url"?: string;
  "href"?: string;
}

export interface Artist {
  "id": number;
  "name"?: string;
  "composer"?: boolean;
  "various"?: boolean;
  "available"?: boolean;
  "cover"?: ArtistCover;
  "genres"?: string[];
  "counts"?: ArtistCounts;
  "ratings"?: ArtistRatings;
  "links"?: ArtistLink[];
  "noPicturesFromSearch"?: boolean;
}

export interface AlbumShort {
  "id": number;
  "title"?: string;
  "year"?: number;
  "releaseDate"?: string;
  "coverUri"?: string;
  "genre"?: string;
  "metaType"?: string;
  "available"?: boolean;
}

export interface TrackShort {
  "id": number;
  "realId"?: number;
  "title"?: string;
  "available"?: boolean;
  "version"?: string;
  "type"?: string;
  "coverUri"?: string;
  "artists"?: Artist[];
  "albums"?: AlbumShort[];
}

export interface Track {
  "id": number;
  "realId"?: number;
  "title"?: string;
  "available"?: boolean;
  "version"?: string;
  "type"?: string;
  "coverUri"?: string;
  "durationMs"?: number;
  "explicit"?: boolean;
  "lyricsAvailable"?: boolean;
  "shortDescription"?: string;
  "fileSize"?: number;
  "regions"?: string[];
  "artists"?: Artist[];
  "albums"?: AlbumShort[];
}

export interface Label {
  "id"?: number;
  "name"?: string;
  "website"?: string;
}

export interface Album {
  "id": number;
  "title"?: string;
  "version"?: string;
  "coverUri"?: string;
  "trackCount"?: number;
  "genre"?: string;
  "year"?: number;
  "releaseDate"?: string;
  "metaType"?: string;
  "available"?: boolean;
  "availableForPremiumUsers"?: boolean;
  "availablePartially"?: boolean;
  "artists"?: Artist[];
  "labels"?: Label[];
  "volumes"?: number[][];
  "tracks"?: Track[];
}

export interface Owner {
  "uid": number;
  "login"?: string;
  "name"?: string;
  "verified"?: boolean;
}

export interface PlaylistCover {
  "type"?: string;
  "uri"?: string;
}

export interface PlaylistShort {
  "owner"?: Owner;
  "uid"?: number;
  "kind": number;
  "title"?: string;
  "description"?: string;
  "trackCount"?: number;
  "visibility"?: string;
  "collective"?: boolean;
  "created"?: string;
  "modified"?: string;
  "available"?: boolean;
  "durationMs"?: number;
  "cover"?: PlaylistCover;
  "ogImage"?: string;
  "tags"?: string[];
  "snapshot"?: number;
}

export interface Playlist {
  "owner"?: Owner;
  "uid"?: number;
  "kind": number;
  "title"?: string;
  "description"?: string;
  "trackCount"?: number;
  "visibility"?: string;
  "collective"?: boolean;
  "created"?: string;
  "modified"?: string;
  "available"?: boolean;
  "durationMs"?: number;
  "cover"?: PlaylistCover;
  "ogImage"?: string;
  "tags"?: string[];
  "snapshot"?: number;
  "tracks"?: (Track | null)[];
}

export interface SearchTracksBlock {
  "total"?: number;
  "perPage"?: number;
  "order"?: number;
  "results"?: TrackShort[];
}

export interface SearchArtistsBlock {
  "total"?: number;
  "perPage"?: number;
  "order"?: number;
  "results"?: Artist[];
}

export interface SearchAlbumsBlock {
  "total"?: number;
  "perPage"?: number;
  "order"?: number;
  "results"?: Album[];
}

export interface SearchPlaylistsBlock {
  "total"?: number;
  "perPage"?: number;
  "order"?: number;
  "results"?: Playlist[];
}

export interface SearchBest {
  "type"?: string;
  "text"?: string;
}

export interface SearchResult {
  "best"?: SearchBest;
  "tracks"?: SearchTracksBlock;
  "artists"?: SearchArtistsBlock;
  "albums"?: SearchAlbumsBlock;
  "playlists"?: SearchPlaylistsBlock;
}

export interface SearchResponse {
  "invocationInfo"?: InvocationInfo;
  "result": SearchResult;
}

export interface SuggestItem {
  "title"?: string;
  "url"?: string;
  "type"?: string;
}

export interface SuggestResponse {
  "result"?: { "suggestions"?: SuggestItem[] };
}

export interface Lyrics {
  "id"?: number;
  "lyrics"?: string;
  "hasRights"?: boolean;
  "textColor"?: string;
  "background"?: string;
}

export interface LyricsResponse {
  "result"?: Lyrics | null;
}

export interface SimilarTracks {
  "track"?: Track;
  "similarTracks"?: Track[];
}

export interface SimilarTracksResponse {
  "result"?: SimilarTracks;
}

export interface TracksResponse {
  "invocationInfo"?: InvocationInfo;
  "result": Track[];
}

export interface AlbumResponse {
  "invocationInfo"?: InvocationInfo;
  "result": Album;
}

export interface ArtistResponse {
  "invocationInfo"?: InvocationInfo;
  "result": Artist;
}

export interface ArtistTracksResult {
  "tracks"?: TrackShort[];
}

export interface ArtistTracksResponse {
  "invocationInfo"?: InvocationInfo;
  "result": ArtistTracksResult;
}

export interface PlaylistsResponse {
  "invocationInfo"?: InvocationInfo;
  "result": PlaylistShort[];
}

export interface PlaylistResponse {
  "invocationInfo"?: InvocationInfo;
  "result": Playlist;
}

export interface Library {
  "uid"?: number;
  "tracks"?: TrackShort[];
}

export interface LikesTracksResponse {
  "invocationInfo"?: InvocationInfo;
  "result"?: { "library"?: Library };
}

export interface MutationResponse {
  "invocationInfo"?: InvocationInfo;
  "result"?: boolean;
}
