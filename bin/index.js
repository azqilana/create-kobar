#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.resolve(__dirname, "../templates/default");

console.log("\n🔥 Selamat datang di Kobar!\n");

const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName) {
  console.log("❌ Error: Nama project tidak boleh kosong!");
  console.log("Gunakan format: npx create-kobar <nama-project>");
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), projectName);

if (fs.existsSync(targetDir)) {
  console.log(`\n❌ Folder "${projectName}" sudah ada!`);
  process.exit(1);
}

console.log(`\n⏳ Membuat project "${projectName}"...`);

// Menyalin folder template menggunakan fs bawaan (fs.cpSync)
try {
  fs.cpSync(templateDir, targetDir, { recursive: true });
  console.log(`\n✔ Project "${projectName}" berhasil dibuat!\n`);
  console.log("Langkah selanjutnya:");
  console.log(`  cd ${projectName}`);
  console.log("  Buka index.html di browser\n");
} catch (err) {
  console.log(`\n❌ Gagal menyalin template: ${err.message}`);
  process.exit(1);
}
