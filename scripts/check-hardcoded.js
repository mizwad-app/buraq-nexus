#!/usr/bin/env node
/**
 * scripts/check-hardcoded.js
 *
 * Pre-commit guard for the Mizwad codebase. Receives a list of staged
 * .ts/.tsx files from lint-staged and checks three rules:
 *
 *   1. Hardcoded Uzbek text in JSX/strings  (ERROR — blocks commit)
 *   2. Stray console.log/warn/error          (WARNING — does not block)
 *   3. <img> tags missing loading="lazy"     (WARNING — does not block)
 *
 * The legacy brand name (from previous project) is enforced by a
 * separate check — see the sibling guard script in this directory.
 *
 * The script is a plain Node.js ES module. It does not require any
 * runtime dependency beyond the Node.js standard library, so it works
 * even before `npm install` has finished resolving transitive deps.
 */

import { readFileSync } from "node:fs";
import { sep } from "node:path";

// ───────────────────────────────────────────────────────────────────
// CLI colors
// ───────────────────────────────────────────────────────────────────
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// ───────────────────────────────────────────────────────────────────
// Rule 1: Uzbek dictionary
// ───────────────────────────────────────────────────────────────────
const UZBEK_WORDS = [
  "Tijorat",
  "Mahsulot",
  "Bozor",
  "Tarjimon",
  "Sayohat",
  "Halol",
  "Masjid",
  "Tasdiqlangan",
  "Qidirish",
  "Yaqin",
  "Boshqa",
  "Mizwad",
  "kun qoldi",
  "Bugun",
  "Hozir",
  "Aniqlanmoqda",
  "Hammasi",
  "Joylashuv",
  "Ko'rgazma",
  "Advokat",
  "Foydalanuvchi",
  "Salom",
  "Yuklanmoqda",
  "Saqlash",
  "Bekor qilish",
  "Yopish",
  "Davom etish",
  "Tekshirish",
];

const uzbekRegex = new RegExp(
  UZBEK_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "g",
);

// "Mizwad" appears in the dictionary as a brand reference but is the
// CORRECT brand. We never flag it — only the other words count.
const IGNORED_UZBEK = new Set(["Mizwad"]);

// ───────────────────────────────────────────────────────────────────
// Other patterns
// ───────────────────────────────────────────────────────────────────
const CONSOLE_REGEX = /\bconsole\.(log|warn|error|debug|info)\s*\(/g;
const IMG_TAG_REGEX = /<img\b[^>]*>/gi;
const IMG_LAZY_REGEX = /loading\s*=\s*["']lazy["']/i;

// Lines or surrounding context that disable a console warning.
const CONSOLE_DISABLE_COMMENT = /eslint-disable-next-line\s+no-console/;
const CONSOLE_DEV_GUARD = /import\.meta\.env\.DEV/;

// Paths that are i18n source-of-truth (translation tables themselves
// legitimately contain Uzbek strings).
const I18N_PATH_FRAGMENTS = [
  `${sep}i18n${sep}`,
  `${sep}locales${sep}`,
  `${sep}translations${sep}`,
];

// ───────────────────────────────────────────────────────────────────
// Diagnostic collectors
// ───────────────────────────────────────────────────────────────────
/** @type {{file:string,line:number,col:number,rule:string,message:string,snippet:string}[]} */
const errors = [];
/** @type {{file:string,line:number,col:number,rule:string,message:string,snippet:string}[]} */
const warnings = [];

function pushError(file, line, col, rule, message, snippet) {
  errors.push({ file, line, col, rule, message, snippet });
}
function pushWarning(file, line, col, rule, message, snippet) {
  warnings.push({ file, line, col, rule, message, snippet });
}

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────

/**
 * Remove segments inside `t("...")` / `t('...')` / `t(\`...\`)` calls
 * so the remaining text can be scanned for hardcoded Uzbek without
 * false positives on already-translated strings. We also strip simple
 * single-line and block comments. The result preserves the original
 * length (replacement with spaces) so column numbers stay meaningful.
 */
function maskTranslatedAndComments(source) {
  let s = source;

  // Block comments  /* ... */
  s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => " ".repeat(m.length));
  // Line comments    // ...
  s = s.replace(/(^|[^:])\/\/[^\n]*/g, (m, prefix) => prefix + " ".repeat(m.length - prefix.length));

  // t("..."), t('...'), t(`...`) — including multi-arg forms like
  // t("key", { count: 3 }). We only need to mask the first string
  // argument; that's where the human-readable key lives.
  s = s.replace(
    /\bt\s*\(\s*(["'`])((?:\\.|(?!\1).)*?)\1/g,
    (m) => " ".repeat(m.length),
  );

  // Also mask i18next.t("..."), useTranslation()-derived t exclusion
  // is already covered by the \bt\b match above.

  return s;
}

function isIgnoredUzbekFile(filePath) {
  return I18N_PATH_FRAGMENTS.some((frag) => filePath.includes(frag));
}

function getLineInfo(source, index) {
  let line = 1;
  let lastNl = -1;
  for (let i = 0; i < index; i++) {
    if (source[i] === "\n") {
      line++;
      lastNl = i;
    }
  }
  return { line, col: index - lastNl };
}

function snippetAt(source, index, span = 60) {
  const start = source.lastIndexOf("\n", index) + 1;
  let end = source.indexOf("\n", index);
  if (end === -1) end = source.length;
  let snippet = source.slice(start, end);
  if (snippet.length > span * 2) {
    const local = index - start;
    const from = Math.max(0, local - span);
    const to = Math.min(snippet.length, local + span);
    snippet = (from > 0 ? "…" : "") + snippet.slice(from, to) + (to < snippet.length ? "…" : "");
  }
  return snippet.trim();
}

// ───────────────────────────────────────────────────────────────────
// Per-file checks
// ───────────────────────────────────────────────────────────────────

function checkFile(filePath) {
  let source;
  try {
    source = readFileSync(filePath, "utf8");
  } catch {
    // File may have been deleted in the staged diff — nothing to scan.
    return;
  }

  // Rule 1: Hardcoded Uzbek (skip translation tables themselves)
  if (!isIgnoredUzbekFile(filePath)) {
    const masked = maskTranslatedAndComments(source);
    uzbekRegex.lastIndex = 0;
    let m;
    while ((m = uzbekRegex.exec(masked)) !== null) {
      const word = m[0];
      if (IGNORED_UZBEK.has(word)) continue;
      const { line, col } = getLineInfo(source, m.index);
      pushError(
        filePath,
        line,
        col,
        "no-hardcoded-uzbek",
        `"${word}" should be wrapped in t("...")`,
        snippetAt(source, m.index),
      );
    }
  }

  // Rule 2: Stray console.log/warn/error (warning, not error)
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    CONSOLE_REGEX.lastIndex = 0;
    const cm = CONSOLE_REGEX.exec(ln);
    if (!cm) continue;

    const prev = lines[i - 1] || "";
    const allowed =
      CONSOLE_DISABLE_COMMENT.test(prev) ||
      CONSOLE_DISABLE_COMMENT.test(ln) ||
      CONSOLE_DEV_GUARD.test(ln) ||
      CONSOLE_DEV_GUARD.test(prev);
    if (allowed) continue;

    pushWarning(
      filePath,
      i + 1,
      cm.index + 1,
      "no-stray-console",
      `console.${cm[1]}() should be guarded by import.meta.env.DEV or removed`,
      ln.trim(),
    );
  }

  // Rule 3: <img> without loading="lazy"
  IMG_TAG_REGEX.lastIndex = 0;
  let tag;
  while ((tag = IMG_TAG_REGEX.exec(source)) !== null) {
    if (IMG_LAZY_REGEX.test(tag[0])) continue;
    const { line, col } = getLineInfo(source, tag.index);
    pushWarning(
      filePath,
      line,
      col,
      "img-needs-lazy",
      `<img> is missing loading="lazy"`,
      snippetAt(source, tag.index),
    );
  }
}

// ───────────────────────────────────────────────────────────────────
// Reporter
// ───────────────────────────────────────────────────────────────────

function format(d) {
  return (
    `${BOLD}${d.file}:${d.line}:${d.col}${RESET}  ${DIM}[${d.rule}]${RESET}\n` +
    `   ${d.message}\n` +
    `   ${CYAN}${d.snippet}${RESET}`
  );
}

function report() {
  if (warnings.length) {
    console.log(`\n${YELLOW}${BOLD}⚠  ${warnings.length} warning(s)${RESET}\n`);
    for (const w of warnings) console.log(format(w) + "\n");
  }
  if (errors.length) {
    console.log(`${RED}${BOLD}✗  ${errors.length} error(s) — commit blocked${RESET}\n`);
    for (const e of errors) console.log(format(e) + "\n");
    console.log(
      `${DIM}Use {t("…")} for user-visible strings. Add new keys to src/i18n/locales/*.${RESET}\n`,
    );
    process.exit(1);
  }

  console.log(`${GREEN}✓ check-hardcoded: all checks passed${RESET}`);
  process.exit(0);
}

// ───────────────────────────────────────────────────────────────────
// Entry point
// ───────────────────────────────────────────────────────────────────

const files = process.argv.slice(2).filter((f) => /\.(ts|tsx)$/.test(f));

if (files.length === 0) {
  // Nothing relevant was staged.
  process.exit(0);
}

for (const f of files) checkFile(f);
report();
