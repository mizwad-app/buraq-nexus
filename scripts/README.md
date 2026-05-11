# scripts/

Repository-level developer tooling. Currently houses the pre-commit
hardcoded-content guard.

## `check-hardcoded.js`

A Node.js (ES modules) script invoked by `lint-staged` from the
`.husky/pre-commit` hook. It receives the list of staged `.ts`/`.tsx`
files as positional arguments, reads each one from disk, and emits
diagnostics for four rules.

### Why this exists

The audit (`AUDIT_REPORT.md`) flagged that new components are
increasingly being authored without `t("…")` wrappers. That trend
quietly accumulates re-translation work and makes the app feel
inconsistent in non-Uzbek locales. This hook stops the bleeding at
commit time so the regression does not grow further while the existing
hot spots are migrated.

### Rules

| # | Rule                 | Severity | Blocks commit? |
|---|----------------------|----------|----------------|
| 1 | Hardcoded Uzbek text | error    | yes            |
| 2 | Legacy `buraq` brand | error    | yes            |
| 3 | Stray `console.*`    | warning  | no             |
| 4 | `<img>` without lazy | warning  | no             |

#### 1. Hardcoded Uzbek text

A curated dictionary of 28 high-traffic Uzbek words/phrases is matched
against the file contents. To minimise false positives, the scanner
masks out:

- single-line and block comments
- the first string argument of any `t("…")` / `t('…')` / `t(\`…\`)` call

Files under `src/i18n/`, `**/locales/**`, or `**/translations/**` are
exempt — those directories *are* the translation source-of-truth.

Bad:

```tsx
<h1>Tijorat Markazi</h1>
<button>Saqlash</button>
```

Good:

```tsx
<h1>{t("business.title")}</h1>
<button>{t("common.save")}</button>
```

If you add a new key, also add the Uzbek/English translations to the
files in `src/i18n/locales/`.

#### 2. Legacy `buraq` brand name

Case-insensitive `\bburaq\b` is flagged anywhere in `.ts`/`.tsx`. The
product is `Mizwad`; the legacy identifier should not appear in new
code.

**Bypass for migration commits:** include the literal token
`[legacy-rename]` anywhere in the commit message. The hook reads
`.git/COMMIT_EDITMSG` and skips this rule when the token is present.
Use this only for commits whose sole purpose is renaming the legacy
identifier — e.g. database migrations or coordinated file renames.

```text
db: rename buraq_users -> mizwad_users [legacy-rename]
```

#### 3. Stray `console.*`

Any `console.log/warn/error/debug/info(` is a warning unless one of
the following is true:

- the previous or same line contains
  `// eslint-disable-next-line no-console`
- the same or previous line guards the call with
  `import.meta.env.DEV`

```tsx
// allowed
if (import.meta.env.DEV) console.log("loaded", data);

// eslint-disable-next-line no-console
console.warn("expected");
```

Warnings do not block the commit — they show up so reviewers (and
future-you) see them in the terminal output.

#### 4. `<img>` without `loading="lazy"`

Any `<img …>` tag (JSX or HTML-like) without `loading="lazy"` is
flagged. This is also a warning, intended to nudge new image markup
toward lazy loading. Use the project's image component or a
deliberate `loading="eager"` for above-the-fold hero imagery and the
warning will… still appear (the rule only checks for `lazy`). If you
need an eager image, add a one-line disable comment or wrap in the
shared `<Image>` component once it exists.

### How it runs

```text
git commit
  └─ .husky/pre-commit
       └─ npx lint-staged
            └─ for each staged *.ts/*.tsx file:
                 node scripts/check-hardcoded.js <files…>
```

`lint-staged` only passes files that are part of the current commit,
so unmodified legacy hot spots are *not* scanned. Only newly authored
or edited code is held to the bar.

### Bypassing (use sparingly)

Sometimes you genuinely need to commit through the hook — e.g. an
emergency revert that you'll clean up immediately afterwards:

```sh
git commit --no-verify -m "hotfix: revert deploy"
```

Do not normalise this. Every `--no-verify` is a small bet against
future-you. Prefer fixing the violation; reach for the bypass only
when the cost of waiting is higher than the cost of a follow-up.

### Running manually

```sh
# Check a specific file
npm run check:hardcoded src/pages/Some.tsx

# Or invoke directly
node scripts/check-hardcoded.js src/pages/Some.tsx src/components/Foo.tsx
```

The script's exit code is `1` if any errors were found, `0` otherwise.
Warnings never affect the exit code.

### Maintenance

- The Uzbek dictionary lives at the top of `check-hardcoded.js`
  (`UZBEK_WORDS`). Add words as you notice new hot phrases creeping
  in.
- The masking logic is heuristic, not a full TypeScript parser. If
  you hit a false positive that can't be silenced by wrapping in
  `t(…)`, file an issue rather than working around it.
- When the existing `console.log` cleanup ships, flip Rule 3 from a
  warning to an error to prevent regressions.
