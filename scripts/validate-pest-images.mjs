#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const PAGE_FILE = path.join(ROOT, "apps/web/src/app/wiki/schaedlinge/page.tsx");
const PUBLIC_ROOT = path.join(ROOT, "apps/web/public");

const JPG_MAGIC = [0xff, 0xd8, 0xff];

function isJpeg(buffer) {
  return buffer.length >= 3 && JPG_MAGIC.every((v, i) => buffer[i] === v);
}

function isSvg(buffer) {
  const head = buffer.toString("utf8", 0, Math.min(buffer.length, 1024)).toLowerCase();
  return head.includes("<svg") || head.includes("<?xml") && head.includes("<svg");
}

function looksLikeHtml(buffer) {
  const head = buffer.toString("utf8", 0, Math.min(buffer.length, 512)).toLowerCase();
  return head.includes("<!doctype html") || head.includes("<html") || head.includes("<head") || head.includes("<body");
}

async function getReferencedImages() {
  const text = await fs.readFile(PAGE_FILE, "utf8");
  const regex = /["'](\/terpira\/pests\/[a-z0-9\-_/]+\.(jpg|svg))["']/gi;
  const refs = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    refs.push(match[1]);
  }
  return refs;
}

async function validateImage(publicPath) {
  const absolute = path.join(PUBLIC_ROOT, publicPath.replace(/^\//, ""));

  try {
    const stat = await fs.stat(absolute);
    if (!stat.isFile()) {
      return { ok: false, path: publicPath, reason: "Kein Datei-Pfad" };
    }

    const content = await fs.readFile(absolute);

    if (looksLikeHtml(content)) {
      return { ok: false, path: publicPath, reason: "Datei ist HTML statt Bild" };
    }

    const ext = path.extname(absolute).toLowerCase();
    if (ext === ".jpg" && !isJpeg(content)) {
      return { ok: false, path: publicPath, reason: "Ungueltige JPEG-Signatur" };
    }

    if (ext === ".svg" && !isSvg(content)) {
      return { ok: false, path: publicPath, reason: "Ungueltige SVG-Struktur" };
    }

    if (ext === ".jpg" && stat.size < 4096) {
      return { ok: false, path: publicPath, reason: `Datei zu klein (${stat.size} Bytes)` };
    }

    const hash = crypto.createHash("sha256").update(content).digest("hex");
    return { ok: true, path: publicPath, size: stat.size, hash };
  } catch {
    return { ok: false, path: publicPath, reason: "Datei fehlt" };
  }
}

function formatSize(bytes) {
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

async function main() {
  const refsRaw = await getReferencedImages();
  if (refsRaw.length === 0) {
    console.error("Keine JPG-Referenzen in schaedlinge/page.tsx gefunden.");
    process.exit(1);
  }

  const counts = refsRaw.reduce((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
  const duplicateRefs = Object.entries(counts).filter(([, count]) => count > 1);

  const refs = [...new Set(refsRaw)].sort();

  const results = await Promise.all(refs.map(validateImage));
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);

  const hashToPaths = new Map();
  for (const item of passed) {
    if (!hashToPaths.has(item.hash)) hashToPaths.set(item.hash, []);
    hashToPaths.get(item.hash).push(item.path);
  }
  const duplicateContentGroups = [...hashToPaths.values()].filter((paths) => paths.length > 1);

  console.log(`Geprueft: ${results.length} eindeutige Bilddateien`);
  console.log(`Referenzen gesamt: ${refsRaw.length}`);
  console.log(`OK: ${passed.length}`);
  console.log(`Fehler: ${failed.length}`);

  if (duplicateRefs.length > 0) {
    console.log("\nDoppelte Bildreferenzen:");
    for (const [imgPath, count] of duplicateRefs) {
      console.log(`- ${imgPath}: ${count}x referenziert`);
    }
  }

  if (duplicateContentGroups.length > 0) {
    console.log("\nDoppelte Bildinhalte (gleicher Hash):");
    for (const group of duplicateContentGroups) {
      console.log(`- ${group.join(" | ")}`);
    }
  }

  if (passed.length > 0) {
    console.log("\nGueltige Dateien:");
    for (const item of passed) {
      console.log(`- ${item.path} (${formatSize(item.size)})`);
    }
  }

  if (failed.length > 0) {
    console.log("\nFehlerhafte Dateien:");
    for (const item of failed) {
      console.log(`- ${item.path}: ${item.reason}`);
    }
    process.exit(1);
  }

  if (duplicateRefs.length > 0) {
    process.exit(1);
  }

  if (duplicateContentGroups.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Image-Health-Check fehlgeschlagen:", error);
  process.exit(1);
});
