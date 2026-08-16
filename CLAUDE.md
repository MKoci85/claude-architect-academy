# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server at http://localhost:5173
npm run build     # Production build
npm run preview   # Preview production build locally
```

No linting or test suite is configured.

## Architecture

React 18 + Vite 7 SPA — fully static, no backend. All content lives in JSON files under `public/data/`. The app is a knowledge hub, primarily in Spanish, for Claude Code and Claude API documentation, with an in-progress English translation.

### Language folders

Content is split into two parallel folders under `public/data/`:
- **`public/data/es/`** — the complete, canonical content (28 files as of this writing). This is the source of truth; new content is written here first.
- **`public/data/en/`** — English translations. As of this writing, translation coverage is complete: every collection/item registered in `es/content.json` has an equivalent in `en/content.json`. The mechanism remains **partial-by-design**, though: `en/content.json` only ever lists collections/items that actually have a translated file, and there is no placeholder or fallback-to-Spanish — a collection with no English file simply doesn't appear when the site is in English mode. New Spanish content is not automatically translated, so this can regress to partial at any time; verify current coverage (e.g. compare item counts between `es/content.json` and `en/content.json`) rather than trusting this note if it's been a while.

Both folders share the exact same per-file schema (see below), but **filenames are independent per language and written in that language** — `es/introduccion.json` is `en/introduction.json`, `es/api-vertex.json` stays `api-vertex.json` (already an English-looking name). Never carry a Spanish filename into `en/`. Each `content.json`'s `file` field points to whatever that language's file is actually called — `es/content.json` and `en/content.json` are independent indexes, not the same file with fewer entries.

`ejercicios.json` (the practice exercises) is not registered in either `content.json` — the "Ejercicios"/"Exercises" button (`goExercises` in `src/hooks/useWikiData.js`) fetches it directly by path rather than going through the collection index. In English mode it requests `public/data/en/exercises.json` first and falls back to `public/data/es/ejercicios.json` if that 404s (translation is optional, same partial-by-design rule as everything else in `en/`); in Spanish mode it always reads `es/ejercicios.json`. Changing the language toggle clears any already-loaded exercises data so the next open re-fetches in the new language.

### Data flow

Content is loaded in **three tiers** so the app never downloads more than it needs: metadata at startup, search text only if the user searches, article bodies only when opened.

```
public/data/{lang}/content.json         ← authored master index (source of truth, hand-edited)
         ↓ (read only by scripts/build-index.mjs, at dev-server start / build time — see below)
public/data/{lang}/*.json               ← one JSON file per collection/sub-collection, full body incl. blocks
         ↓ (build-index.mjs splits into two artifacts: metadata vs. search text)
public/data/{lang}/index.json           ← generated, gitignored: collections → sections → articles,
  (~21KB gz)                              each article has id/title/summary/sourceFile/articleIndex +
                                          subsection TITLES only. No body text, no blocks.
         ↓ (fetched at startup, `lang` from useLanguage() / localStorage 'wiki-lang')
src/hooks/useWikiData.js                ← owns collections/search/navigation state
         ↓ (only on the user's first keystroke in the search box)
public/data/{lang}/search-index.json    ← generated, gitignored: [{ key, texts[] }], the flattened plain
  (~135KB gz)                             text of every subsection. `key` is `${sourceFile}#${articleIndex}`
         ↓
src/searchEngine.js                     ← buildSearchIndex(collections, searchDocs) joins the text back
                                          onto each article by that key, then scores queries
         ↓
src/App.jsx                             ← thin shell: composes useTheme/useLanguage/useHashRoute/useWikiData
         ↓ (only when the user opens a specific article)
public/data/{lang}/{sourceFile}         ← fetched on demand, cached in a ref keyed by `${lang}:${sourceFile}`,
                                          to get that article's real `blocks` for rendering
```

**Why the split:** the search text is ~380KB raw against ~40KB of metadata. Shipping both together (the old single `index-lite.json`) meant the "lite" index was 157KB gzip — more than double the entire JS bundle — downloaded on every visit whether or not anyone searched. Splitting drops the initial data payload to ~21KB gzip. Search still works before the text lands: `buildSearchIndex` called with no `searchDocs` matches titles/summaries only, and the results recompute automatically once the fetch resolves.

`index.json` and `search-index.json` are **build artifacts, not authored content** — generated by `scripts/build-index.mjs`, gitignored, and regenerated automatically by the `dataIndexPlugin` in `vite.config.js` every time `npm run dev` starts (and again on any `public/data/**/*.json` change while it's running) or `npm run build` runs. Never edit them by hand; edit the real per-collection file and `content.json` instead — the "Adding content" workflow below is unaffected. Note `index.json` is generated while `content.json` is authored — don't confuse the two.

`fetchLocalized(file, lang)` in `src/data/fetchLocalized.js` does the `/data/${lang}/${file}` fetch and returns `null` on a non-OK response — used by `openArticle`'s on-demand full-article fetch. A `null` collection/item is filtered out, which is what makes untranslated content disappear in English mode instead of erroring.

### Routing

URLs are hash-based (`src/hooks/useHashRoute.js`), so the site stays fully static — no server rewrites needed. The URL is the source of truth for the current view; navigation callbacks write to it and a single effect in `useWikiData` reacts:

```
#/es                          home
#/es/c/Claude%20Code          home filtered to a collection
#/es/a/hooks.json/3           article 3 of hooks.json
#/es/a/hooks.json/3/2         same, scrolled to subsection 2 (used by search results)
#/es/ejercicios/1             exercise 1
```

Articles are addressed by `sourceFile` + `articleIndex` rather than a slug because many articles have no `id` — that pair is the same key already used to join the search index and to locate the full article inside its source file. An unresolvable article URL falls back to home via `replace` (no broken history entry). The URL's `lang` segment wins over `localStorage` on first load, so a shared `#/en/...` link opens in English.

### Content schema

**content.json** lists collections. Each collection is either:
- **Single-file**: has `"file": "name.json"`
- **isSuper** (multi-section): has `"items": [{ "title", "file", "description" }]`

**Each `*.json` collection file** has the shape:
```json
{
  "id": "...",
  "title": "...",
  "summary": "...",
  "sections": [{
    "title": "...",
    "articles": [{
      "id": "...",
      "title": "...",
      "summary": "...",
      "subsections": [{
        "title": "...",
        "blocks": [{ "type": "text|code|callout|cards|table|steps|stats|compare", ... }]
      }]
    }]
  }]
}
```

### Source layout (src/)

`App.jsx` was originally a single ~1170-line file holding all UI, state, routing, i18n and block rendering. It's now split by concern — this is pure code motion, not a rewrite, so behavior is unchanged:

```
src/
  App.jsx                  ← thin shell: composes useTheme + useLanguage + useWikiData, renders TopBar/HomeView/ArticleView/ExercisesView
  main.jsx, styles.css, searchEngine.js   ← unchanged

  i18n/
    strings.jsx             ← UI_STRINGS (es/en fixed-copy dictionary, has JSX so can't be .js) + useUI(lang)
    useLanguage.js           ← useLanguage() hook (localStorage 'wiki-lang')

  hooks/
    useTheme.js               ← useTheme() hook (localStorage 'wiki-theme' + matchMedia)
    useDebounce.js             ← generic debounce hook
    useWikiData.js              ← owns collections/search/navigation state — the one non-trivial piece, see below

  constants/
    collections.js             ← COLLECTION_BADGE / collectionBadge() / COLLECTION_ACCENT

  utils/
    markdown.js                 ← parseMd() inline markdown→HTML
    highlight.js                 ← highlightMatch() for search-result snippets

  data/
    fetchLocalized.js            ← fetchLocalized(file, lang), see Data flow above

  components/
    Md.jsx, TopBar.jsx, ArticleCard.jsx, SuperSectionView.jsx, CollectionCard.jsx,
    HomeView.jsx, ArticleView.jsx, ExercisesView.jsx, SubsectionContent.jsx
    icons/index.jsx              ← IconSearch/IconChevronLeft/IconChevronRight/IconArrow/IconHome
    blocks/                       ← one file per block type + dispatcher
      BlockText.jsx, BlockCode.jsx, BlockCallout.jsx, BlockCards.jsx,
      BlockTable.jsx, BlockSteps.jsx, BlockStats.jsx, BlockCompare.jsx, index.jsx (Block dispatcher)
```

`hooks/useWikiData.js` is the only piece that took real design judgment rather than pure code motion: it owns `collections`, `searchIndex`, `allArticles`, `activeCollection`, `search`/`debouncedSearch`, `searchResults`, `view`, `activeArticle`, `highlightTarget`, `exercisesData`, `activeExercise`, plus the `fullCollectionCache` ref and `openRequestRef` ref, and exposes the navigation callbacks (`openArticle`, `goHome`, `handleToggleLang`, `goExercises`, `goHomeToCollection`, `openCollection`). It takes `lang` as a parameter rather than owning it — `useLanguage()` stays independent in `App.jsx`, and `App`'s own `handleToggleLang` wrapper passes `toggleLang` into `wiki.handleToggleLang` so the hook can reset navigation state before flipping the language. `hljs.registerLanguage(...)` calls live in `components/blocks/BlockCode.jsx` (their only consumer), not in `App.jsx`.

`components/` stays flat (no `views/` subfolder) — with only ~8 view-level components plus TopBar, one folder was enough. `blocks/` got its own subfolder because it's 8 renderer files dispatched by one `index.jsx`.

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | App shell — composes the hooks above, routes between HomeView/ArticleView/ExercisesView |
| `src/hooks/useWikiData.js` | Collections/search/navigation state + the fetch/cache logic (see Source layout above) |
| `src/components/blocks/index.jsx` | `Block` dispatcher — switches on `block.type` to the 8 block renderers |
| `src/searchEngine.js` | Full-text search with scoring (title 30pt, section 30pt, subsection 20pt, content 10pt, summary 20pt) |
| `src/styles.css` | Tailwind directives + CSS custom properties for light/dark theme |
| `public/data/es/content.json` | Master collection index, Spanish (complete) |
| `public/data/en/content.json` | Master collection index, English (only translated collections) |
| `public/practice/index.html` | Standalone practice exam (separate HTML page, English only, no `es`/`en` split) |
| `src/hooks/useHashRoute.js` | Hash routing — `parseHash`/`buildHash`/`useHashRoute`, see Routing above |
| `vite.config.js` | Includes `practiceRoutePlugin` (serves `/practice`) and `dataIndexPlugin` (regenerates `index.json` + `search-index.json`) |
| `scripts/build-index.mjs` | Generates `public/data/{lang}/index.json` + `search-index.json` from `content.json` + the full collection files |

### App state

`theme` from `useTheme()` (`src/hooks/useTheme.js`); `lang` (`'es' | 'en'`) from `useLanguage()` (`src/i18n/useLanguage.js`); everything else — `collections`, `searchIndex`, `allArticles`, `activeCollection`, `search`, `debouncedSearch` (280ms), `searchResults`, `view` (`'home' | 'article' | 'ejercicios'`), `activeArticle` — from `useWikiData(lang)` (`src/hooks/useWikiData.js`).

### Block types (rendered in ArticleView)

`text`, `code` (highlight.js), `callout`, `cards`, `table`, `steps`, `stats`, `compare` — one component per type under `src/components/blocks/`, dispatched by `Block` in `src/components/blocks/index.jsx`.

### Accessibility basics

Structural only — the palette is deliberately left alone; contrast is not audited here.

- **Heading hierarchy is real markup.** Subsection titles are `<h2>` inside a `<section aria-labelledby>`, not styled `<div>`s. If you add a new content-rendering view, use real headings — a `<div class="subsection-title">` renders identically but leaves screen readers with no document outline.
- **One `<main id="content">` per view** — it's the target of the skip link (first tabbable element, in `TopBar`). The home hero sits *inside* `<main>` because it holds the `<h1>`.
- **Reduced motion** is honored in CSS and in JS — use `scrollBehavior()` from `src/utils/motion.js` rather than hardcoding `behavior: 'smooth'`.
- Scrollable `<pre>` code blocks carry `tabIndex={0}` so keyboard users can scroll them.

### Fixed UI strings (chrome, not content)

Fixed interface text (search placeholder, "Ejercicios"/"Exercises" button, breadcrumb "Inicio"/"Home", empty-state messages, hero copy, etc. — everything that isn't fetched JSON content) lives in the `UI_STRINGS` dictionary in `src/i18n/strings.jsx`, keyed by `es`/`en`. Components that render any of this text receive `lang` as a prop and call `useUI(lang)` (also in `strings.jsx`) to get the resolved strings object (`t`). When adding a new piece of fixed UI copy, add both the `es` and `en` entries to `UI_STRINGS` rather than hardcoding a string in JSX — a hardcoded string won't flip when the user toggles the language switch. Switching languages (`handleToggleLang`, split between `App.jsx` and `hooks/useWikiData.js`) also resets the view to home first, since the currently open article/collection may not exist in the other language's (partial) content tree.

### Adding content

For the workflow order, the es/en translation decision, and voice/verification
rules, use the `add-wiki-content` skill — it covers process, not schema. What
follows here is the structural/schema reference that skill points back to.

1. Create or update a JSON file in `public/data/es/` following the collection schema above — Spanish is the source of truth, write here first.
2. Register it in `public/data/es/content.json` (either as a new `collections` entry or as an item inside an existing `isSuper` collection).
3. No manual build step — `index.json` and `search-index.json` (see Data flow above) regenerate automatically the next time the dev server restarts or picks up the file change, or on `npm run build`. If the dev server is already running, saving the collection file triggers `dataIndexPlugin`'s watcher and it regenerates within that same session too.
4. **Optional — English translation**: create the file at `public/data/en/<english-filename>.json` — give it an English filename (translate the filename too, don't carry over the Spanish one) — with the identical schema and structure (same `id`s, same block types, same order), translating only the text fields — never translate code, model IDs, or CLI flags. Then register it in `public/data/en/content.json`, mirroring the entry from `es/content.json` but pointing at the English filename. If you skip this step, the content simply won't appear when the site is in English mode — that's expected, not a bug to route around.

**Before writing anything new:**

- **Check for overlap first.** Grep the existing `es/api-*.json` / `es/permisos.json` / `es/mcp.json` / `es/ejercicios.json` collections for the same ground. If a topic is already covered, extend it — a new subsection or block inside the existing article — instead of writing a parallel one, even a well-written duplicate. A new top-level card in `content.json` is warranted only when the topic genuinely doesn't fit inside any existing `isSuper` collection; the default is to distribute new material across the existing files that already own each sub-topic (e.g. an "antipatrón" that touches agent architecture, prompt caching, Claude Code CI/CD, and MCP gets split across `api-agentes.json`, `api-avanzado.json`, `permisos.json`, and `mcp.json` respectively, not written as one new standalone file). If the topic has an English translation, apply the same extend-don't-duplicate check there too and keep both versions structurally in sync.
- **"Antipatrón vs. óptimo" content uses the `compare` block**, not a callout — it's the native format for that framing. Two schema variants exist in this codebase and both render: `{"left": {"head", "rows": [{"key","value"}]}}` (used in `api-*.json`; `title` also works as a synonym for `head` in this variant — `renderCol` reads `col.head || col.label || col.title`) and `{"left": {"label", "items": [...]}}` (used in `permisos.json`, `mcp.json`). Match whichever variant the surrounding file already uses — don't mix them within one file, and never use a bare `{"title", "content"}` shape (no `rows`/`items`) — the renderer silently drops that content with nothing shown on screen.
- **`table` blocks read `headers` or `columns` for the header row — never `head`.** `BlockTable` does `const headers = block.headers || block.columns;` — `head` is not one of the accepted keys, so a table written with `"head": [...]` silently renders with no header row (the data rows still show). This is easy to confuse with `compare`, whose columns *do* use `head` (`col.head || col.label || col.title`) — that's a different block type with a different renderer. Before writing a `table`, check `headers`/`columns` is what the nearest existing example in the file uses; if you ever see `"type": "table"` paired with `"head"`, that's a bug, not a valid third variant — fix it to `columns` (or `headers`) rather than copying it.
- **Callout field names differ by file — check a nearby callout before writing one.** `api-agentes.json` / `api-avanzado.json` / `api-mcp.json` use `"style"`; `permisos.json` / `ejercicios.json` use `"variant"`; `mcp.json` uses `"kind"` (sometimes paired with an `"icon"` emoji); several files (`sistema-de-memoria.json`, parts of `hooks.json`) skip variant/style entirely and use only `"icon"` + `"content"`. All of these render fine (`BlockCallout` reads `block.variant || block.style`) — don't guess the field name from another file, match the nearest example.
- **`stats` blocks use `{"value", "label"}`**, not `{"number", "label"}` — `BlockStats` only reads `item.value`. A `"number"` field renders as blank.
- **Never invent CLI flags, SDK method/hook names, or MCP protocol details.** For Claude Code CLI, Claude Agent SDK, or MCP specifics, verify exact syntax before writing it into content — use the `claude-code-guide` agent or the `claude-api` skill rather than recalling from training data, especially for anything presented as CCAR-F-exam-accurate. If a mechanism isn't documented (e.g. no native recursion guard in MCP), say that explicitly in the content instead of filling the gap with a plausible-sounding invention.
- **Absence from official docs isn't proof a feature is invented.** Some Claude Code capabilities ship behind server-side feature flags gated per account/org, with no changelog or docs.claude.com entry at all — `sistema-de-memoria.json`'s Auto Dream is a confirmed real example (Anthropic-confirmed, but never publicly documented; only tracked via a community-reported GitHub issue). A `claude-code-guide` docs search coming up empty is a signal to dig further (GitHub issues, direct user reports, hands-on demos), not a green light to delete the section. If something turns out to be real-but-unstable, say so explicitly and flag it as likely to go stale faster than the rest of the site — don't silently invent a takedown either.
- **Model IDs in new code examples**: match the generation already used across the site (`claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`) rather than introducing a different generation in a single file. Never use a retired model ID (anything in the `3.x` family) or present an outdated-but-still-active one (e.g. `claude-sonnet-4-5`) as "the current model" — check `shared/models.md` via the `claude-api` skill if unsure what's current.

## CCAR-F Exam — Reference for Practice Content

Official credential: **Claude Certified Architect – Foundations**, exam code **CCAR-F** (formerly referred to as CCA-F).

### Official Exam Guide (authoritative when available)

Anthropic publishes an official PDF Exam Guide ("Claude Certified Architect – Foundations Exam Guide") with the full domain blueprint, per-domain Task Statements (each with "Knowledge of" / "Skills in" lists), ~12 sample questions with explanations, and — critically — **4 Preparation Exercises (its Section 8)** that `public/data/es/ejercicios.json`'s four exercises are meant to mirror step-for-step. If the user shares this PDF (or a newer version) in a session, treat it as authoritative over the condensed summary below — cross-check `ejercicios.json` and `examen_cca_f_en.json` against its exact Task Statements and Section 8 steps rather than reconstructing from memory, and update this file's summary if something here is stale. The guide isn't checked into this repo (shared ad hoc as an attachment when needed), so don't assume it's on disk — ask the user to paste it again if a session needs it and doesn't have it.

**Domain numbering gotcha (confirmed against Exam Guide v1.0, July 2026):** the guide's own Domain numbers do **not** match this repo's internal domain order. The guide numbers them Domain 1=Agentic Architecture & Orchestration, **Domain 2=Tool Design & MCP Integration**, **Domain 3=Claude Code Configuration & Workflows**, Domain 4=Prompt Engineering & Structured Output, Domain 5=Context Management & Reliability. This repo's internal domain `id` in `examen_cca_f_en.json` and the `DOMAINS` array in `public/practice/index.html` instead order them Agentic(1), **Claude Code Config(2)**, **Tool Design & MCP(3)**, Prompt Engineering(4), Context Mgmt(5) — domains 2 and 3 are swapped relative to the guide. The weights and question counts are identical either way (Tool Design & MCP is always 18%/11 questions, Claude Code Config is always 20%/12), only the *number* differs. This matters when tagging or referencing a `taskStatement` (e.g. "2.3") — always use the guide's numbering for that field, not this repo's internal domain `id`.

When adding or fixing a preparation exercise against the guide's Section 8, verify any Claude Agent SDK / MCP / Claude Code CLI mechanism the guide names (e.g. `PreToolUse`/`PostToolUse` hooks, `createSdkMcpServer`, the MCP `isError` flag, the `-p`/`--output-format json` CLI flags) against real docs before writing code — see "Adding content" above. The guide's Domain 2 Task 2.2 defines error categories as **four**, not three: `transient` / `validation` / `business` / `permission` — a policy-threshold violation (e.g. "refund exceeds $500") is `business`, not `permission`.

### Logistics
- **60 questions**, multiple-choice AND multiple-response — some items require selecting more than one correct answer; each item states how many responses to select
- **120 minutes** (2 min/question)
- **Passing score:** scaled score of 720 on a 100–1,000 scale
- **Exam fee:** $125 USD per attempt
- **Platform:** Pearson VUE (online proctored or test center); registration and scheduling via the Anthropic Partner Academy. Score report: pass/fail with scaled score plus percent-correct by domain
- **Validity:** 12 months from the date the credential is awarded; free non-proctored renewal assessment if done on time. Retake waiting periods after a failed attempt: 14 days (1st fail), 30 days (2nd), 90 days (3rd); max 4 attempts per rolling 12-month period

### Real exam format: scenario-based
The exam uses **6 production scenarios**; each candidate gets **4 chosen at random**, each generating ~10 integrated questions. Questions within a scenario share a narrative thread — they are NOT grouped by domain.

| # | Scenario | Covers |
|---|---|---|
| 1 | Customer Support Resolution Agent | When to escalate vs. resolve, agentic loops |
| 2 | Code Generation with Claude Code | CLAUDE.md, custom commands, plan mode |
| 3 | Multi-Agent Research System | Coordinator–subagent, parallel/sequential orchestration |
| 4 | Developer Productivity with Claude | MCP, integrated tools, automation |
| 5 | Claude Code for CI/CD | Automated reviews, test generation, PR feedback |
| 6 | Structured Data Extraction | Document processing with JSON validation |

Since 4 of 6 scenarios are random, any scenario skipped carries a real risk of costing 25% of the exam.

### Domain weights
Listed here in this repo's internal order (matches `examen_cca_f_en.json` domain `id` and the `DOMAINS` array in `practice/index.html`). The "Guide #" column is the official Exam Guide's own Domain number — see the numbering gotcha above before using it to tag `taskStatement`.

| Domain | Guide # | Weight | ~Questions |
|---|---|---|---|
| Agentic Architecture & Orchestration | 1 | 27% | 16 |
| Claude Code Configuration & Workflows | 3 | 20% | 12 |
| Prompt Engineering & Structured Output | 4 | 20% | 12 |
| Tool Design & MCP Integration | 2 | 18% | 11 |
| Context Management & Reliability | 5 | 15% | 9 |

### What the exam tests
- **Is NOT:** memorization, definitions, drag-and-drop, labs
- **Is:** real production systems + architectural decision-making; sophisticated distractors (options that are technically correct but wrong for that specific scenario); tradeoffs like cost vs. reliability, subagents vs. single loop, when to escalate to a human
- **Difficulty:** harder than expected from theory alone; candidates without hands-on Claude system experience consistently underperform

### Practice question authoring guidelines
`examen_cca_f_en.json` holds 265 domain-grouped questions (good conceptual bank), including multiple-response items (`correctAnswers` array + `selectCount`) alongside single-answer ones (`correctAnswer`). Each exam attempt guarantees a minimum ~22% multiple-response floor per domain (this is a pedagogical choice made for this simulator, not a documented feature of the real exam's item mix — see `MIN_MULTI_RATIO` in `public/practice/index.html`). The simulator samples by domain weight, not by the real exam's 4-of-6 scenario draw — see "Real exam format" above.

**Question-level metadata (internal audit fields, not read by the frontend):** every question also carries `id` (`D{domain}-Q{seq}`, e.g. `D2-Q07`), `taskStatement` (guide numbering, e.g. `"2.3"` — see the domain-numbering gotcha above), `concept` (a short kebab-case tag for the specific principle being tested, reused across questions that test the identical concept, e.g. `hook-vs-prompt-enforcement`), `difficulty` (`easy`/`medium`/`hard` — an author-assigned starting heuristic, not empirically validated against real pass rates), and `scenario` (one of the 6 official scenario slugs — `customer-support`, `code-generation`, `multi-agent-research`, `developer-productivity`, `ci-cd`, `structured-extraction`, matching the scenarios table above — every question is anchored to one). `public/practice/index.html`'s `buildPoolsFromJson` only reads `text`/`options`/`correctAnswer(s)`/`explanation`, so these fields are safe to extend but won't affect the simulator unless you wire them in. Use them for bank audits (Task Statement coverage, concept over/under-representation, difficulty balance) rather than deleting them as unused cruft.

When writing new questions:

1. **Frame as a production scenario** — describe a real system, team, or constraint, then ask for a decision or diagnosis.
2. **One unambiguously best answer** — the correct option must be best *for that context*, not just technically true in isolation.
3. **Sophisticated distractors** — wrong options should be plausible or true in other scenarios, never obviously absurd.
4. **No trivia or definitions** — avoid "what is X" or "what is the maximum context window" style questions.
5. **Target the decision layer** — questions should require production intuition: architecture choices, failure handling, tradeoff resolution.
6. **Cover scenario types** — balance across the 6 exam scenarios, not just domain tags.
7. **Explanation field** — must state *why* the correct answer is best and implicitly why the main distractor fails.
8. **Name the trap, not just the answer** — the shared `explanation` field should call out the specific misconception the strongest distractor is designed to exploit (e.g. "mistaking conversational text for the completion signal when stop_reason says otherwise"), not just restate why the correct option is right. This single-field format is intentional for this bank (`buildPoolsFromJson` only reads `explanation`, not a per-option breakdown) — write one sentence (or two, if needed) that does double duty: justify the answer AND defuse the trap, rather than adding new per-option fields to the schema. **Length is not a target.** This is study material — optimize for whether a learner reading it actually understands *why* the trap is tempting and *why* it's wrong, not for hitting a character count. A short explanation that's already clear should stay short; a genuinely subtle trap may legitimately need three sentences. Never pad a clear explanation with restated content just to make it longer, and never truncate a genuinely complex trap just to make it shorter.

### Example questions by domain

**Agentic Architecture & Orchestration**
> A customer support agent is mid-conversation when the user asks it to issue a full refund on an order from 14 months ago — outside the system's stated 12-month policy. The agent has a `process_refund` tool with no built-in policy enforcement. What is the correct design-level response to this gap?
> - A) The agent should invoke `process_refund` anyway and let the downstream system reject it.
> - B) The agent should refuse the request, citing the policy, and close the conversation.
> - C) The agent should escalate to a human review queue, preserving full conversation context.
> - D) The agent should ask the user for proof of purchase before making any decision.
>
> **Answer: C** — Edge cases outside defined policy boundaries are exactly the escalation condition the human-in-the-loop gate exists for. Refusing autonomously (B) closes off a potentially legitimate exception; invoking the tool blindly (A) offloads the decision to a system that may silently fail or succeed incorrectly.

---

**Claude Code Configuration & Workflows**
> A team's CLAUDE.md instructs Claude Code to always run the full test suite before proposing any refactor. A developer opens Claude Code mid-refactor and asks it to rename a single internal helper function. Claude Code runs the full suite (4 min), then proceeds. A teammate argues this is wasteful and proposes removing the instruction. What is the better resolution?
> - A) Remove the instruction — blanket rules shouldn't apply to trivial changes.
> - B) Keep the instruction as-is — consistency matters more than speed in shared codebases.
> - C) Scope the instruction with an exception for rename-only operations that don't touch logic.
> - D) Move the instruction to a personal settings file so each developer can opt in.
>
> **Answer: C** — CLAUDE.md instructions should encode team intent precisely; an overly broad rule that fires on trivial cases creates friction without safety benefit. Removing it entirely (A) loses the protection for real refactors. Personal opt-in (D) defeats the purpose of shared policy.

---

**Prompt Engineering & Structured Output**
> A pipeline extracts contract clauses from scanned PDFs and outputs JSON. In production, ~8% of records have a `termination_date` field that arrives as `null` even when the date is clearly visible in the document. Increasing max_tokens has no effect. What is the most likely cause and the correct fix?
> - A) The model is hallucinating nulls; add few-shot examples with populated `termination_date` values.
> - B) The extraction prompt doesn't instruct the model on how to handle ambiguous date formats, so it defaults to null on uncertainty.
> - C) The JSON schema marks `termination_date` as optional, so the model omits it when confidence is low.
> - D) The scanned PDFs have OCR errors that the model cannot recover from regardless of prompting.
>
> **Answer: C** — When a field is schema-optional, the model treats omission as a valid low-risk choice under uncertainty. Making the field required with an explicit `"unknown"` sentinel forces the model to surface uncertainty rather than silently drop the value. Few-shot examples (A) help but don't address the structural incentive.

---

**Tool Design & MCP Integration**
> An MCP server exposes a `search_knowledge_base` tool with this description: *"Search the knowledge base."* The parameter is `q: string`. In production, the agent frequently calls this tool with malformed queries and low relevance. A teammate proposes rewriting the description to be more detailed. Another proposes adding a second, more specific tool. Which intervention is correct, and why?
> - A) Rewrite the description only — a richer description is sufficient to guide query construction.
> - B) Add a second tool — splitting by use case is always better than improving a single tool.
> - C) Rewrite the description with query format, content scope, and when to prefer it over other search tools; adding a second tool is only warranted if the use cases are genuinely distinct.
> - D) Add example queries as enum values for `q` to constrain what the model can send.
>
> **Answer: C** — The description is the model's primary signal for when and how to use a tool. A vague description causes both selection errors and malformed inputs. A second tool is a valid option only if the underlying use cases differ; splitting arbitrarily increases selection confusion. Enum-constraining a free-text query field (D) is the wrong primitive.

---

**Context Management & Reliability**
> A long-running research agent is processing a 90-page regulatory document. After ~60 pages, the response quality degrades: the agent starts contradicting earlier findings and omitting key references it cited correctly before. No errors are returned. What is the most likely cause and the appropriate architectural response?
> - A) The model is hallucinating due to document complexity; switch to a larger model.
> - B) The agent is approaching its context limit and recent tokens are crowding out earlier content; introduce a summarization or retrieval step to manage the working context.
> - C) The tool returning document chunks has a bug that starts returning duplicate pages after page 60.
> - D) The system prompt is too long and should be shortened to leave room for the document.
>
> **Answer: B** — Degrading coherence without errors is the classic symptom of context window pressure, not hallucination or tool bugs. The fix is architectural: summarize processed sections or use retrieval to keep only relevant content in the active window. Switching models (A) delays but doesn't solve the structural problem.
