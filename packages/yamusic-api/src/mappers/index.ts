import type {
  AccountStatusResult,
  Album as AlbumDto,
  AlbumShort,
  Artist as ArtistDto,
  LibraryTrackRef as LibraryTrackRefDto,
  Lyrics as LyricsDto,
  Playlist as PlaylistDto,
  PlaylistShort,
  SearchResult as SearchResultDto,
  Track as TrackDto,
  TrackShort,
} from "../generated/dto.js";
import type {
  Account,
  Album,
  AlbumRef,
  Artist,
  ArtistRef,
  LibraryTrack,
  Lyrics,
  Playlist,
  PlaylistOwner,
  SearchResult,
  Track,
} from "../models/index.js";
import { getCoverUrl } from "../parsers/cover-url.js";

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mapArtistRef(dto: ArtistDto): ArtistRef {
  return { id: dto.id, name: dto.name ?? "" };
}

export function mapAlbumRef(dto: AlbumShort): AlbumRef {
  return {
    id: dto.id,
    title: dto.title ?? "",
    year: dto.year,
    coverUri: dto.coverUri,
  };
}

export function mapTrack(dto: TrackDto | TrackShort): Track {
  const coverUri = dto.coverUri ?? dto.albums?.[0]?.coverUri;

  return {
    id: dto.id,
    title: dto.title ?? "",
    artists: (dto.artists ?? []).map(mapArtistRef),
    albums: (dto.albums ?? []).map(mapAlbumRef),
    durationMs: "durationMs" in dto ? dto.durationMs : undefined,
    coverUri,
    coverUrl: getCoverUrl(coverUri),
    available: dto.available,
    explicit: "explicit" in dto ? dto.explicit : undefined,
    version: dto.version,
    lyricsAvailable: "lyricsAvailable" in dto ? dto.lyricsAvailable : undefined,
  };
}

export function mapLibraryTrack(dto: LibraryTrackRefDto): LibraryTrack {
  return {
    id: Number(dto.id),
    albumId: dto.albumId === undefined ? undefined : Number(dto.albumId),
    timestamp: dto.timestamp,
  };
}

export function mapAlbum(dto: AlbumDto): Album {
  return {
    id: dto.id,
    title: dto.title ?? "",
    artists: (dto.artists ?? []).map(mapArtistRef),
    labels: (dto.labels ?? [])
      .map((label) => label.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0),
    version: dto.version,
    year: dto.year,
    releaseDate: dto.releaseDate,
    genre: dto.genre,
    trackCount: dto.trackCount,
    coverUri: dto.coverUri,
    coverUrl: getCoverUrl(dto.coverUri),
    available: dto.available,
    availableForPremiumUsers: dto.availableForPremiumUsers,
    tracks: dto.tracks ? dto.tracks.map(mapTrack) : undefined,
  };
}

export function mapArtist(dto: ArtistDto): Artist {
  const coverUri = dto.cover?.uri;

  return {
    id: dto.id,
    name: dto.name ?? "",
    coverUri,
    coverUrl: getCoverUrl(coverUri),
    genres: dto.genres ?? [],
    links: (dto.links ?? []).map((link) => ({ title: link.title, url: link.url ?? link.href })),
    counts: dto.counts,
    available: dto.available,
    composer: dto.composer,
    various: dto.various,
  };
}

export function mapPlaylist(dto: PlaylistDto | PlaylistShort): Playlist {
  const owner: PlaylistOwner | null = dto.owner
    ? {
        uid: dto.owner.uid,
        login: dto.owner.login,
        name: dto.owner.name,
        verified: dto.owner.verified,
      }
    : dto.uid !== undefined
      ? { uid: dto.uid }
      : null;

  const tracks =
    "tracks" in dto && Array.isArray(dto.tracks)
      ? dto.tracks.filter((track): track is TrackDto => track !== null).map(mapTrack)
      : undefined;

  const coverUri = dto.cover?.uri ?? dto.ogImage;

  return {
    owner,
    kind: dto.kind,
    title: dto.title ?? "",
    description: dto.description,
    trackCount: dto.trackCount,
    visibility: dto.visibility,
    collective: dto.collective,
    created: dto.created,
    modified: dto.modified,
    revision: dto.revision,
    coverUri,
    coverUrl: getCoverUrl(coverUri),
    tags: dto.tags ?? [],
    tracks,
  };
}

export function mapPlaylistEntry(entry: unknown): Playlist | null {
  if (!isRecord(entry)) return null;
  if ("kind" in entry) return mapPlaylist(entry as unknown as PlaylistShort);

  const inner = entry.playlist;
  if (isRecord(inner)) {
    const owner = entry.owner ?? inner.owner;
    return mapPlaylist({ ...inner, owner } as unknown as PlaylistShort);
  }

  return null;
}

export function mapAccount(dto: AccountStatusResult): Account {
  return {
    uid: dto.account.uid,
    login: dto.account.login,
    displayName: dto.account.displayName,
    fullName: dto.account.fullName,
    firstName: dto.account.firstName,
    secondName: dto.account.secondName,
    serviceAvailable: dto.account.serviceAvailable,
    plus:
      dto.plus === undefined
        ? undefined
        : {
            hasPlus: dto.plus.hasPlus ?? false,
            isTutorialCompleted: dto.plus.isTutorialCompleted ?? false,
          },
  };
}

export function mapLyrics(dto: LyricsDto | null | undefined): Lyrics | null {
  if (!dto) return null;

  return {
    id: dto.id ?? 0,
    text: dto.lyrics ?? null,
    hasRights: dto.hasRights ?? false,
  };
}

export function mapSearchResult(dto: SearchResultDto): SearchResult {
  return {
    tracks: (dto.tracks?.results ?? []).map(mapTrack),
    artists: (dto.artists?.results ?? []).map(mapArtist),
    albums: (dto.albums?.results ?? []).map(mapAlbum),
    playlists: (dto.playlists?.results ?? []).map(mapPlaylist),
    totals: {
      tracks: dto.tracks?.total,
      artists: dto.artists?.total,
      albums: dto.albums?.total,
      playlists: dto.playlists?.total,
    },
  };
}
