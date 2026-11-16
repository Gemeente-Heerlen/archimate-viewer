#!/usr/bin/env node
/* Bouwt de website van de viewer: index.html plus het versleutelde model (model.enc).

   Gebruik:
     VIEWER_PASSWORD='…' node build.mjs --model <pad naar coArchi-repository> --out _site
     node build.mjs --model <pad> --stamp        (alleen het versiekenmerk tonen)

   Het model wordt gecomprimeerd en versleuteld met AES-256-GCM; de sleutel wordt met PBKDF2
   uit het wachtwoord afgeleid. Alleen Node.js is nodig, geen extra pakketten. */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { pbkdf2Sync, randomBytes, createCipheriv, createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

const ITERATIONS = 600_000;
const MIN_PASSWORD_LENGTH = 12;
const here = dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const arg = (name, fallback) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : fallback; };
const fail = message => { console.error("FOUT: " + message); process.exit(1); };
const git = (dir, ...a) => { try { return execFileSync("git", ["-C", dir, ...a], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };

const modelRepo = arg("model");
if (!modelRepo) fail("geef het pad naar de modelrepository op met --model.");
if (!existsSync(join(modelRepo, "model"))) fail(`geen map 'model' gevonden in ${modelRepo}; verwacht een coArchi-repository.`);

// Versiekenmerk: verandert als het model of de viewer verandert, zonder iets over het model prijs te geven.
const modelCommit = git(modelRepo, "rev-parse", "HEAD");
const viewerCommit = process.env.GITHUB_SHA || git(here, "rev-parse", "HEAD");
const stamp = createHash("sha256").update(`${modelCommit}:${viewerCommit}`).digest("hex").slice(0, 32);
if (args.includes("--stamp")) { console.log(stamp); process.exit(0); }

const password = (process.env.VIEWER_PASSWORD || "").normalize("NFC").trim();
if (!password) fail("het wachtwoord ontbreekt. Zet het in de omgevingsvariabele VIEWER_PASSWORD (in GitHub: het secret VIEWER_PASSWORD).");
if (password.length < MIN_PASSWORD_LENGTH) fail(`het wachtwoord is te kort (${password.length} tekens). Omdat het versleutelde model openbaar staat, zijn minimaal ${MIN_PASSWORD_LENGTH} tekens vereist; een zin van enkele woorden werkt goed.`);

// Modelbestanden verzamelen: alle XML onder model/ en het .archimate-bestand in de hoofdmap.
const files = [];
(function walk(dir, rel) {
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    const path = rel + "/" + entry.name;
    if (entry.isDirectory()) walk(join(dir, entry.name), path);
    else if (entry.name.endsWith(".xml")) files.push({ path, text: readFileSync(join(dir, entry.name), "utf8") });
  }
})(join(modelRepo, "model"), "model");
if (!files.length) fail("de map 'model' bevat geen XML-bestanden.");
let name = "ArchiMate-model";
for (const entry of readdirSync(modelRepo)) {
  if (!entry.endsWith(".archimate")) continue;
  const text = readFileSync(join(modelRepo, entry), "utf8");
  files.push({ path: entry, text });
  name = entry.replace(/\.archimate$/, "");
}

const payload = { v: 1, name, commit: modelCommit.slice(0, 7), date: git(modelRepo, "log", "-1", "--format=%cs"), files };
const plain = gzipSync(Buffer.from(JSON.stringify(payload), "utf8"), { level: 9 });

// De salt is vast per website, zodat een onthouden sleutel na een nieuwe publicatie blijft werken.
const salt = createHash("sha256").update("archimate-viewer:" + (process.env.GITHUB_REPOSITORY || "lokaal")).digest().subarray(0, 16);
const key = pbkdf2Sync(password, salt, ITERATIONS, 32, "sha256");
const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
const header = Buffer.alloc(8);
header.write("AMV1", 0, "latin1");
header.writeUInt32BE(ITERATIONS, 4);

const out = arg("out", "_site");
mkdirSync(out, { recursive: true });
copyFileSync(join(here, "index.html"), join(out, "index.html"));
writeFileSync(join(out, "model.enc"), Buffer.concat([header, salt, iv, encrypted]));
writeFileSync(join(out, "version.json"), JSON.stringify({ stamp }) + "\n");
writeFileSync(join(out, ".nojekyll"), "");
console.log(`${name}: ${files.length} bestanden -> ${join(out, "model.enc")} (${Math.round((encrypted.length + 36) / 1024)} kB, versleuteld)`);
