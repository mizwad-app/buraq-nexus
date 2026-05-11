#!/usr/bin/env node
/**
 * scripts/check-buraq.js
 *
 * Hard pre-commit guard against the legacy "buraq" identifier.
 *
 * The Mizwad project was renamed from "Buraq Nexus" to "Mizwad" because
 * the original name caused brand confusion with an unrelated logistics
 * company ("Buraq Logistics"). To keep new code free of the legacy
 * identifier, this script scans the full content of every staged file
 * and blocks the commit if `buraq` appears (case-insensitive).
 *
 * Scope is intentionally wider than `check-hardcoded.js`: source code,
 * config, JSON, Markdown, HTML, and CSS are all scanned. Lock files
 * and historical SQL migrations are exempt — see ALLOWED_PATHS.
 *
 * Invoked from `lint-staged` with the staged file paths as argv.
 */

import { readFileSync } from "node:fs";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// Match "buraq" anywhere — including snake_case (`buraq_verified`) and
// PascalCase (`BuraqApp`) where word boundaries (`\b`) would NOT fire
// because the surrounding character is itself a word char (`_` or an
// uppercase letter immediately after).
const BURAQ_PATTERN = /buraq/gi;

// Paths where occurrences are tolerated: lock files we don't author,
// the immutable historical SQL migrations directory, and the brand
// guard's own source / docs (which legitimately discuss the legacy
// identifier in order to ban it). The current rebrand task will
// rename DB columns in a follow-up TZ via separate migration files;
// the *historical* migrations must stay byte-stable.
const ALLOWED_PATHS = [
  /(^|\/)supabase\/migrations\/\d+_.*\.sql$/,
  /(^|\/)package-lock\.json$/,
  /(^|\/)yarn\.lock$/,
  /(^|\/)pnpm-lock\.yaml$/,
  /(^|\/)bun\.lockb$/,
  /(^|\/)scripts\/check-buraq\.js$/,
  /(^|\/)scripts\/README\.md$/,
  /(^|\/)src\/i18n\/locales\//,
];

// Self-reference: any occurrence of `buraq` that is part of the literal
// substring `check-buraq` is a reference to the guard script's own
// filename (lint-staged config, npm scripts, docs). Skip those — they
// are not usages of the legacy brand.
function isSelfReference(content, index) {
  return content.substr(Math.max(0, index - 6), 11) === "check-buraq";
}

const files = process.argv.slice(2);

if (files.length === 0) {
  process.exit(0);
}

const errors = [];

for (const file of files) {
  if (ALLOWED_PATHS.some((p) => p.test(file))) continue;

  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    // Binary or unreadable — skip silently.
    continue;
  }

  const lines = content.split("\n");
  let match;
  BURAQ_PATTERN.lastIndex = 0;
  while ((match = BURAQ_PATTERN.exec(content)) !== null) {
    if (isSelfReference(content, match.index)) continue;
    const lineNumber = content.substring(0, match.index).split("\n").length;
    errors.push({
      file,
      line: lineNumber,
      match: match[0],
      context: (lines[lineNumber - 1] || "").trim(),
    });
  }
}

if (errors.length > 0) {
  const bar = "━".repeat(60);
  console.error(`\n${RED}${BOLD}✗ "buraq" FORBIDDEN — BRAND VIOLATION${RESET}`);
  console.error(`${DIM}${bar}${RESET}`);
  console.error(`Loyiha "Buraq Nexus" → "Mizwad" rebrand qilingan.`);
  console.error(`Buraq Logistics bilan aloqasi YO'Q.`);
  console.error(`${DIM}${bar}${RESET}\n`);

  for (const err of errors) {
    const suffix = err.match.includes("_") ? "_*" : "*";
    console.error(`  ${BOLD}${err.file}:${err.line}${RESET}`);
    console.error(`    Found:   ${YELLOW}"${err.match}"${RESET}`);
    console.error(`    Line:    ${DIM}${err.context}${RESET}`);
    console.error(
      `    Fix:     rename "${err.match}" → "mizwad${suffix}"\n`,
    );
  }

  console.error(
    `${RED}Total: ${errors.length} "buraq" occurrence(s) — commit BLOCKED.${RESET}\n`,
  );
  process.exit(1);
}

process.exit(0);
