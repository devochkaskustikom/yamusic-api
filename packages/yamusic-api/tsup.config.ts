import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "node20",
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
});
