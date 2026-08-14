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

React 18 + Vite 8 SPA — fully static, no backend. All content lives in JSON files under `public/data/`. The app is a knowledge hub (in Spanish) for Claude Code and Claude API documentation.

### Data flow

```
public/data/content.json   ← master index of all collections
         ↓ (fetched at startup)
public/data/*.json         ← one JSON file per collection/sub-collection
         ↓
src/searchEngine.js        ← builds flat article index, scores full-text queries
         ↓
src/App.jsx                ← all UI, routing, and state (single file, ~1060 lines)
```

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

### Key files

| File | Role |
|---|---|
| `src/App.jsx` | Entire app: all components, state, routing, block renderers (~1060 lines) |
| `src/searchEngine.js` | Full-text search with scoring (title 30pt, section 30pt, subsection 20pt, content 10pt, summary 20pt) |
| `src/styles.css` | Tailwind directives + CSS custom properties for light/dark theme |
| `public/data/content.json` | Master collection index |
| `public/practice/index.html` | Standalone practice exam (separate HTML page) |
| `vite.config.js` | Includes `practiceRoutePlugin` to serve `/practice` from `public/practice/index.html` |

### App state (all in App.jsx via React hooks)

`theme`, `collections`, `searchIndex`, `allArticles`, `activeCollection`, `search`, `debouncedSearch` (280ms), `searchResults`, `view` (`'home' | 'article'`), `activeArticle`

### Block types (rendered in ArticleView)

`text`, `code` (highlight.js), `callout`, `cards`, `table`, `steps`, `stats`, `compare`

### Adding content

1. Create or update a JSON file in `public/data/` following the collection schema above.
2. Register it in `public/data/content.json` (either as a new `collections` entry or as an item inside an existing `isSuper` collection).
3. No build step needed — files are fetched at runtime.

**Before writing anything new:**

- **Check for overlap first.** Grep the existing `api-*.json` / `permisos.json` / `mcp.json` / `ejercicios.json` collections for the same ground. If a topic is already covered, extend it — a new subsection or block inside the existing article — instead of writing a parallel one, even a well-written duplicate. A new top-level card in `content.json` is warranted only when the topic genuinely doesn't fit inside any existing `isSuper` collection; the default is to distribute new material across the existing files that already own each sub-topic (e.g. an "antipatrón" that touches agent architecture, prompt caching, Claude Code CI/CD, and MCP gets split across `api-agentes.json`, `api-avanzado.json`, `permisos.json`, and `mcp.json` respectively, not written as one new standalone file).
- **"Antipatrón vs. óptimo" content uses the `compare` block**, not a callout — it's the native format for that framing. Two schema variants exist in this codebase and both render: `{"left": {"head", "rows": [{"key","value"}]}}` (used in `api-*.json`) and `{"left": {"label", "items": [...]}}` (used in `permisos.json`, `mcp.json`). Match whichever variant the surrounding file already uses — don't mix them within one file.
- **Callout field names differ by file — check a nearby callout before writing one.** `api-agentes.json` / `api-avanzado.json` / `api-mcp.json` use `"style"`; `permisos.json` / `ejercicios.json` use `"variant"`; `mcp.json` uses `"kind"` (sometimes paired with an `"icon"` emoji). Don't guess the field name from another file.
- **Never invent CLI flags, SDK method/hook names, or MCP protocol details.** For Claude Code CLI, Claude Agent SDK, or MCP specifics, verify exact syntax before writing it into content — use the `claude-code-guide` agent or the `claude-api` skill rather than recalling from training data, especially for anything presented as CCAR-F-exam-accurate. If a mechanism isn't documented (e.g. no native recursion guard in MCP), say that explicitly in the content instead of filling the gap with a plausible-sounding invention.
- **Model IDs in new code examples**: match the generation already used across the site (`claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5-20251001`) rather than introducing a different generation in a single file. Never use a retired model ID (anything in the `3.x` family) or present an outdated-but-still-active one (e.g. `claude-sonnet-4-5`) as "the current model" — check `shared/models.md` via the `claude-api` skill if unsure what's current.

## CCAR-F Exam — Reference for Practice Content

Official credential: **Claude Certified Architect – Foundations**, exam code **CCAR-F** (formerly referred to as CCA-F).

### Official Exam Guide (authoritative when available)

Anthropic publishes an official PDF Exam Guide ("Claude Certified Architect – Foundations Exam Guide") with the full domain blueprint, per-domain Task Statements (each with "Knowledge of" / "Skills in" lists), ~12 sample questions with explanations, and — critically — **4 Preparation Exercises (its Section 8)** that `public/data/ejercicios.json`'s four exercises are meant to mirror step-for-step. If the user shares this PDF (or a newer version) in a session, treat it as authoritative over the condensed summary below — cross-check `ejercicios.json` and `examen_cca_f_en.json` against its exact Task Statements and Section 8 steps rather than reconstructing from memory, and update this file's summary if something here is stale. Domain numbering in the guide (Domain 1–5) maps 1:1 to the weights table below. The guide isn't checked into this repo (it's shared ad hoc as an attachment), so don't assume it's on disk — ask the user to paste it again if a session needs it and doesn't have it.

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
| Domain | Weight | ~Questions |
|---|---|---|
| Agentic Architecture & Orchestration | 27% | 16 |
| Claude Code Configuration & Workflows | 20% | 12 |
| Prompt Engineering & Structured Output | 20% | 12 |
| Tool Design & MCP Integration | 18% | 11 |
| Context Management & Reliability | 15% | 9 |

### What the exam tests
- **Is NOT:** memorization, definitions, drag-and-drop, labs
- **Is:** real production systems + architectural decision-making; sophisticated distractors (options that are technically correct but wrong for that specific scenario); tradeoffs like cost vs. reliability, subagents vs. single loop, when to escalate to a human
- **Difficulty:** harder than expected from theory alone; candidates without hands-on Claude system experience consistently underperform

### Practice question authoring guidelines
`examen_cca_f_en.json` holds 265 domain-grouped questions (good conceptual bank), including multiple-response items (`correctAnswers` array + `selectCount`) alongside single-answer ones (`correctAnswer`). Each exam attempt guarantees a minimum ~22% multiple-response floor per domain (see `MIN_MULTI_RATIO` in `public/practice/index.html`). When writing new questions:

1. **Frame as a production scenario** — describe a real system, team, or constraint, then ask for a decision or diagnosis.
2. **One unambiguously best answer** — the correct option must be best *for that context*, not just technically true in isolation.
3. **Sophisticated distractors** — wrong options should be plausible or true in other scenarios, never obviously absurd.
4. **No trivia or definitions** — avoid "what is X" or "what is the maximum context window" style questions.
5. **Target the decision layer** — questions should require production intuition: architecture choices, failure handling, tradeoff resolution.
6. **Cover scenario types** — balance across the 6 exam scenarios, not just domain tags.
7. **Explanation field** — must state *why* the correct answer is best and implicitly why the main distractor fails.

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
