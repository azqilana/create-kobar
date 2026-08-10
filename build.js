import * as esbuild from "esbuild";
import fs from "fs-extra";
import path from "path";

const outDir = path.resolve("templates/default/system");

console.log("🔥 Kobar - Building system...");

await fs.ensureDir(outDir);

// Buat temporary entry point yang re-export semua
const tempEntry = path.resolve("system/_kobar_entry.js");
await fs.writeFile(tempEntry, `
export * from "./app.js";
export * from "./observer.js";
export * from "./registry.js";
export * from "./component.js";
export * from "./element.js";
export * from "./proxy.js";
export * from "./route.js";
export * from "./build.js";
`);

// Bundle jadi satu file
await esbuild.build({
  entryPoints: [tempEntry],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: `${outDir}/kobar.min.js`,
  platform: "browser",
});

// Hapus temporary entry
await fs.remove(tempEntry);

console.log("✅ Build selesai → templates/default/system/kobar.min.js");
