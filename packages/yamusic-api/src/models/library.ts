export interface LibraryTrack {
  readonly id: number;
  readonly albumId?: number;
  /** Момент добавления в библиотеку в формате ISO 8601. */
  readonly timestamp?: string;
}
