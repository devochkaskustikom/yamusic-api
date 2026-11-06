import type { ArtistRef } from "./track.js";
import type { Track } from "./track.js";

export interface Album {
  readonly id: number;
  readonly title: string;
  readonly artists: readonly ArtistRef[];
  readonly labels: readonly string[];
  readonly version?: string;
  readonly year?: number;
  readonly releaseDate?: string;
  readonly genre?: string;
  readonly trackCount?: number;
  readonly coverUri?: string;
  readonly coverUrl?: string;
  readonly available?: boolean;
  readonly availableForPremiumUsers?: boolean;
  readonly tracks?: readonly Track[];
}
