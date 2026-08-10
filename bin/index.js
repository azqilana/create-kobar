#!/usr/bin/env node

import prompts from "prompts";
import kleur from "kleur";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.resolve(__dirname, "../templates/default");

console.log(kleur.yellow().bold("\n🔥 Selamat datang di Kobar!\n"));

const args = process.argv.slice(2);
let projectName = args[0];

if (!projectName) {
  const response = await prompts({
    type: "text",
    name: "projectName",
    message: "Nama project kamu:",
    validate: (val) => val.trim() !== "" || "Nama project tidak boleh kosong",
  });

  if (!response.projectName) {
    console.log(kleur.red("Dibatalkan."));
    process.exit(0);
  }

  projectName = response.projectName.trim();
}

const targetDir = path.resolve(process.cwd(), projectName);

if (fs.existsSync(targetDir)) {
  console.log(kleur.red(`\nFolder "${projectName}" sudah ada!`));
  process.exit(1);
}

console.log(kleur.cyan(`\nMembuat project "${projectName}"...`));

// Copy template ke folder project baru
await fs.copy(templateDir, targetDir);

console.log(kleur.green().bold(`\n✅ Project "${projectName}" berhasil dibuat!\n`));
console.log(kleur.white(`Langkah selanjutnya:\n`));
console.log(kleur.white(`  cd ${projectName}`));
console.log(kleur.white(`  Buka index.html di browser\n`));
