import { YandexMusicClient } from "@dvkskustikom/yamusic-api";

const token = process.env.YANDEX_MUSIC_TOKEN;
if (!token) {
  console.error("Задайте переменную окружения YANDEX_MUSIC_TOKEN.");
  process.exit(1);
}

const client = new YandexMusicClient({ token, transport: { timeoutMs: 15_000 } });

const account = await client.account.me();
console.log(`Аккаунт: ${account.displayName ?? account.login ?? account.uid}`);
console.log(`Подписка Plus: ${account.plus?.hasPlus ? "есть" : "нет"}`);

const query = process.argv[2] ?? "Кино";
const found = await client.search.query(query, { type: "track" });

console.log(`\n«${query}»: найдено треков — ${found.totals.tracks ?? found.tracks.length}`);
for (const track of found.tracks.slice(0, 5)) {
  const artists = track.artists.map((artist) => artist.name).join(", ");
  const seconds = Math.round((track.durationMs ?? 0) / 1000);
  console.log(`  ${track.title} — ${artists} (${seconds} с)`);
}
