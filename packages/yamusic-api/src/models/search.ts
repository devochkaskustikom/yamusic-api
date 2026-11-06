import type { Album } from "./album.js";
import type { Artist } from "./artist.js";
import type { Playlist } from "./playlist.js";
import type { Track } from "./track.js";

export interface SearchTotals {
  readonly tracks?: number;
  readonly artists?: number;
  readonly albums?: number;
  readonly playlists?: number;
}

export interface SearchResult {
  readonly tracks: readonly Track[];
  readonly artists: readonly Artist[];
  readonly albums: readonly Album[];
  readonly playlists: readonly Playlist[];
  readonly totals: SearchTotals;
}
