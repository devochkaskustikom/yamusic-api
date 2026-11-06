import type { Track } from "./track.js";

export interface PlaylistOwner {
  readonly uid: number;
  readonly login?: string;
  readonly name?: string;
  readonly verified?: boolean;
}

export type PlaylistVisibility = "public" | "private";

export interface Playlist {
  readonly owner: PlaylistOwner | null;
  readonly kind: number;
  readonly title: string;
  readonly description?: string;
  readonly trackCount?: number;
  readonly visibility?: PlaylistVisibility | string;
  readonly collective?: boolean;
  readonly created?: string;
  readonly modified?: string;
  readonly revision?: number;
  readonly coverUri?: string;
  readonly coverUrl?: string;
  readonly tags: readonly string[];
  readonly tracks?: readonly Track[];
}
