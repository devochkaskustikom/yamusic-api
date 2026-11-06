export interface ArtistCounts {
  readonly tracks?: number;
  readonly directAlbums?: number;
  readonly alsoAlbums?: number;
  readonly alsoTracks?: number;
}

export interface ArtistLink {
  readonly title?: string;
  readonly url?: string;
}

export interface Artist {
  readonly id: number;
  readonly name: string;
  readonly coverUri?: string;
  readonly coverUrl?: string;
  readonly genres: readonly string[];
  readonly links: readonly ArtistLink[];
  readonly counts?: ArtistCounts;
  readonly available?: boolean;
  readonly composer?: boolean;
  readonly various?: boolean;
}
