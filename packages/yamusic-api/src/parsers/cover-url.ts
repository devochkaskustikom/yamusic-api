export type CoverSize =
  | "50x50"
  | "100x100"
  | "200x200"
  | "300x300"
  | "400x400"
  | "700x700"
  | "1000x1000";

const DEFAULT_SIZE: CoverSize = "400x400";

export function getCoverUrl(uri: string | undefined | null, size: CoverSize = DEFAULT_SIZE): string | undefined {
  if (!uri) return undefined;

  const value = uri.trim();
  if (value.length === 0) return undefined;

  if (value.includes("%%")) {
    const replaced = value.replaceAll("%%", size);
    if (/^https?:\/\//.test(replaced)) return replaced;
    if (replaced.startsWith("//")) return `https:${replaced}`;
    return `https://${replaced}`;
  }

  if (value.startsWith("//")) return `https:${value}`;
  if (/^https?:\/\//.test(value)) return value;

  return `https://${value}`;
}

export function getTrackCoverUrl(
  track: { readonly coverUri?: string; readonly albums?: readonly { readonly coverUri?: string }[] },
  size: CoverSize = DEFAULT_SIZE,
): string | undefined {
  return getCoverUrl(track.coverUri ?? track.albums?.[0]?.coverUri, size);
}
