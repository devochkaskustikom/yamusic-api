import { YandexMusicClient } from "@dvkskustikom/yamusic-api";

const token = process.env.YANDEX_MUSIC_TOKEN;
if (!token) {
  console.error("Задайте переменную окружения YANDEX_MUSIC_TOKEN.");
  process.exit(1);
}

const client = new YandexMusicClient({ token });

const playlists = await client.playlists.list();
console.log(`Плейлистов в библиотеке: ${playlists.length}`);

for (const playlist of playlists.slice(0, 10)) {
  const count = playlist.trackCount ?? playlist.tracks?.length ?? "?";
  console.log(`  [${playlist.kind}] ${playlist.title} - ${count} треков`);
}

const kind = Number(process.argv[2] ?? playlists[0]?.kind);
if (!Number.isSafeInteger(kind) || kind <= 0) {
  console.log("\nПлейлистов нет - показывать нечего.");
  process.exit(0);
}

const playlist = await client.playlists.get(kind);
console.log(`\n${playlist.title}: ${playlist.tracks?.length ?? playlist.trackCount ?? 0} треков`);

for (const track of (playlist.tracks ?? []).slice(0, 5)) {
  const artists = track.artists.map((artist) => artist.name).join(", ");
  console.log(`  ${track.title} - ${artists}`);
}

// Мутация библиотеки выполняется только по явному флагу --like <trackId>.
const likeIndex = process.argv.indexOf("--like");
const likeId = likeIndex === -1 ? undefined : process.argv[likeIndex + 1];
if (likeId) {
  const ok = await client.likes.tracks.add(likeId);
  console.log(`\nЛайк для ${likeId}: ${ok ? "поставлен" : "не удался"}`);
}
