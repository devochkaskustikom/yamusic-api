import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const targets = [
  "packages/yamusic-api/src/generated",
  "packages/yamusic-api/docs/endpoints.md",
];

async function collect(path, files) {
  let info;
  try {
    info = await stat(path);
  } catch {
    return;
  }

  if (info.isDirectory()) {
    for (const entry of await readdir(path)) {
      await collect(join(path, entry), files);
    }
    return;
  }

  files.push(path);
}

async function snapshot() {
  const files = [];
  for (const target of targets) {
    await collect(join(root, target), files);
  }

  const hashes = new Map();
  for (const file of files) {
    const digest = createHash("sha256").update(await readFile(file)).digest("hex");
    hashes.set(relative(root, file).replaceAll("\\", "/"), digest);
  }
  return hashes;
}

const before = await snapshot();

const exitCode = await new Promise((resolve) => {
  const child = spawn("pnpm codegen", { cwd: root, stdio: "inherit", shell: true });
  child.on("exit", (code) => resolve(code ?? 1));
});

if (exitCode !== 0) {
  console.error("\nКодогенерация завершилась с ошибкой.");
  process.exit(exitCode);
}

const after = await snapshot();
const changed = [...after].filter(([file, hash]) => before.get(file) !== hash).map(([file]) => file);
const removed = [...before.keys()].filter((file) => !after.has(file));

if (changed.length === 0 && removed.length === 0) {
  console.log("\nСгенерированный код совпадает со спецификацией.");
  process.exit(0);
}

console.error("\nСгенерированный код разошёлся со спецификацией:");
for (const file of changed) console.error(`  изменён: ${file}`);
for (const file of removed) console.error(`  удалён:  ${file}`);
console.error(
  "\nЗакоммитьте результат `pnpm codegen`. Файлы src/generated и docs/endpoints.md\n" +
    "правятся только спецификацией spec/ym-api.yaml.",
);
process.exit(1);
