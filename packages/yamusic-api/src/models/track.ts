export interface ArtistRef {
  readonly id: number;
  readonly name: string;
}

export interface AlbumRef {
  readonly id: number;
  readonly title: string;
  readonly year?: number;
  readonly coverUri?: string;
}

export interface Track {
  readonly id: number;
  readonly title: string;
  readonly artists: readonly ArtistRef[];
  readonly albums: readonly AlbumRef[];
  readonly durationMs?: number;
  readonly coverUri?: string;
  readonly coverUrl?: string;
  readonly available?: boolean;
  readonly explicit?: boolean;
  readonly version?: string;
  readonly lyricsAvailable?: boolean;
}
