# Claude Architect Academy

> Complete preparation for the **Claude Certified Architect – Foundations (CCAR-F)** certification: curated documentation on Claude Code and the Claude API, architecture exercises solved step by step, and a practice exam faithful to the question format and domain distribution published by Anthropic.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Language](https://img.shields.io/badge/language-spanish%20%2B%20partial%20english-red)](#)

🇪🇸 [Leer esto en español](README.md)

---

## Table of contents

- [What is this?](#what-is-this)
- [Key features](#key-features)
- [Content covered](#content-covered)
- [Anthropic-recommended courses](#anthropic-recommended-courses)
- [Quick start](#quick-start)
- [Practical exercises](#practical-exercises)
- [CCAR-F practice exam](#ccar-f-practice-exam)
- [Project structure](#project-structure)
- [Stack](#stack)
- [Adding content](#adding-content)
- [License](#license)

---

## What is this?

A static editorial hub — no backend, no database — that centralizes Claude's technical documentation, complements it with architecture exercises solved step by step the way a senior solutions architect would approach them, and combines it with an exam simulator based on the question format and domain weights Anthropic publishes for the **Claude Certified Architect — Foundations** certification.

This isn't an automatic translation of the official docs: it's curated content, actively verified against Anthropic's live documentation (CLI, Agent SDK, API, MCP), specifically designed to close the gap between "I know the theory" and "I can make the right architecture call under exam pressure."

The site has a language switcher (ES/EN) in the top bar. The English translation now covers all registered collections and the practical exercises — see [Project structure](#project-structure).

---

## Key features

| Module | Description |
|---|---|
| **Curated collections** | 15 collections / 27 content files — Claude Code and Claude API — with sections, articles, and rich blocks (text, code, callouts, tables, steps, stats, comparisons) |
| **Full-text search** | Relevance scoring across titles, summaries, and body — with 280ms debounce |
| **Light / dark theme** | Automatic system preference detection, persistent toggle |
| **Practical exercises** | 4 extensive exercises solved step by step the way a senior solutions architect would approach them, with complete code and a dedicated common-mistakes-and-antipatterns section per exercise |
| **Practice exam** | Pool of 265 questions (multiple-choice and multiple-response) with official domain weights, 120-minute timer, and results report |

---

## Content covered

### Claude Code

Introduction, Rules, Permissions, Hooks system (plus its stdio fundamentals), Skills, Memory System (Auto Memory, Auto Dream, context compaction), Subagents, MCP, and Glob Patterns.

### Claude API

14 subsections: getting started, models and versions, tool use, RAG and agentic search, MCP in depth, prefill and alternatives, complete API reference, key concepts, practical guides, prompt engineering, prompt evaluation, agents and workflows, advanced capabilities (Extended Thinking, Files API, Managed Agents), Claude on Vertex AI, and Claude on AWS Bedrock.

### AI Fluency

The 4D framework (*Delegation, Description, Discernment, Diligence*) from Anthropic Academy's free course, recommended as exam preparation — with practical exercises and a guided project included.

---

## Anthropic-recommended courses

Anthropic recommends seven free Partner Academy courses as CCAR-F exam prep. This repository covers **all of them, with room to spare** — not as a course-by-course transcript, but by integrating each topic into the site's own reference structure: the content replaces the course material instead of accompanying it, so you won't find phrases like "this lesson explains..." anywhere here.

| Official course | Coverage in this repo |
|---|---|
| **AI Fluency: Framework & Foundations** | Dedicated collection — the complete 4D framework (*Delegation, Description, Discernment, Diligence*) |
| **Building with the Claude API** | All 14 subsections of *Claude API* — from getting started to advanced capabilities |
| **Claude on Google Cloud** | *Claude on Vertex AI* covers the platform-specific parts (the `AnthropicVertex` client, model ID format, regional availability); the rest of the syllabus — prompting, tool use, RAG, MCP, evals, agents and workflows — already lives in the *Claude API* collections, which are cloud-platform-agnostic |
| **Claude Code in Action** | The entire *Claude Code* section: Introduction, Rules, Permissions, Hooks (plus its stdio fundamentals), Skills, Memory System, Subagents, MCP, and Glob Patterns |
| **Claude 101** | Dedicated collection — everyday-use fundamentals of Claude |
| **Claude with Amazon Bedrock** | Dedicated *Claude on AWS Bedrock* collection |
| **Introduction to Model Context Protocol** | *MCP* for hands-on protocol use, plus *Claude API → MCP in depth* for the host/client/server architecture, resources, and prompts |

No course is left uncovered. The one case that doesn't follow a clean 1:1 course-to-collection mapping is *Claude on Google Cloud*: its generic API content (prompt evaluation, RAG, tool use, MCP, agents) is distributed across the *Claude API* collections rather than duplicated into its own collection — that's intentional, since that material doesn't depend on which cloud platform is used.

---

## Quick start

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # production build in dist/
npm run preview   # preview the local build
```

No environment variables, no extra configuration: all content is served as static JSON at runtime.

---

## Practical exercises

Available from the **Exercises** button in the main navigation. Four end-to-end scenarios, each solved step by step with complete code and the explicit reasoning behind every design decision:

1. **Multi-tool agent with escalation logic** — agentic loop with MCP tools, structured error handling (`isError`), and a `PreToolUse` hook that deterministically routes sensitive operations to human review.
2. **Configuring Claude Code for a team workflow** — `CLAUDE.md` hierarchies, path-scoped rules in `rules/`, isolated skills with `context: fork`, project/user-level MCP, and when plan mode actually adds value.
3. **Structured data extraction pipeline** — JSON schemas with nullable fields, validation-retry loops, few-shot prompting, the Message Batches API, and confidence-based routing to human review.
4. **Designing and debugging a multi-agent research pipeline** — coordinator-subagent orchestration, parallel execution via `Task`, structured output with provenance tracing, and synthesis of conflicting sources.

Each exercise closes with a **common mistakes and antipatterns to avoid** section — for example, validating a business rule against model input instead of a source of truth, confusing a permissions error with a business-policy error, or hand-rolling a mechanism the SDK already solves natively.

---

## CCAR-F practice exam

Available at `/practice`. Replicates the logistics and domain distribution of the real exam (60 questions, 120 minutes, official weights); it does not reproduce the real format's 4-of-6 narrative-scenario selection, since the simulator builds each attempt by weighted domain instead of by scenario:

- **60 random questions** drawn from a pool of 265, categorized by domain
- **Weighted distribution** matching each area's official weight
- **Multiple-choice and multiple-response** — as a pedagogical choice of this simulator (not a documented feature of the real exam), it guarantees a floor of ~22% multiple-response questions per domain on each attempt, to ensure sufficient exposure to that format
- **120-minute timer** (2 min/question)
- **Performance report** by domain at the end
- **Navigation map** to jump between questions

### Exam domains

| Domain | Weight |
|---|---|
| Agentic Architecture & Orchestration | 27% |
| Claude Code Configuration & Workflows | 20% |
| Prompt Engineering & Structured Output | 20% |
| Tool Design & MCP Integration | 18% |
| Context Management & Reliability | 15% |

### The real exam format: 6 scenarios, 4 at random

Anthropic's real exam doesn't group questions by domain — it organizes them into **6 production scenarios**, each with ~10 integrated questions that share a narrative thread and touch multiple domains at once. Each candidate receives **4 of the 6 scenarios, chosen at random**: any scenario left unreviewed carries the risk of costing 25% of the exam.

| # | Scenario | Covers |
|---|---|---|
| 1 | Customer Support Resolution Agent | When to escalate vs. resolve, agentic loops |
| 2 | Code Generation with Claude Code | CLAUDE.md, custom commands, plan mode |
| 3 | Multi-Agent Research System | Coordinator-subagent, parallel/sequential orchestration |
| 4 | Developer Productivity with Claude | MCP, integrated tools, automation |
| 5 | Claude Code for CI/CD | Automated reviews, test generation, PR feedback |
| 6 | Structured Data Extraction | Document processing with JSON validation |

That's why this simulator's 265-question pool is internally tagged by scenario (`scenario` field on each question) in addition to domain — to allow, in the future, auditing scenario coverage even though the simulator currently builds each attempt by domain weight.

### Real exam logistics

- **60 questions**, multiple-choice and multiple-response, **120 minutes** (2 min/question)
- **Passing score**: 720 on a 100–1,000 scale
- **Cost**: USD 125 per attempt
- **Platform**: Pearson VUE (online proctored or test center), registration via Anthropic Partner Academy
- **Validity**: 12 months from the date the credential is awarded, with free non-proctored renewal if done on time
- **Waiting periods after a failed attempt**: 14 days (1st attempt), 30 days (2nd), 90 days (3rd) — max 4 attempts per rolling 12-month period

### Example questions

The question bank is in English (the real exam's format) and tests decision-making judgment, not memorization. Two representative examples:

**Single-answer** — *Agentic Architecture and Orchestration*
> A multi-agent research system has a document subagent that finds conflicting figures between a government report (GDP growth: 2.1%) and an industry dataset (GDP growth: 3.4%) for the same quarter. The subagent has completed its analysis task. What should it do with this conflict before returning its result?
> - Use the government figure since official sources are generally more rigorous, and continue without flagging it.
> - Average both values to produce a neutral figure (2.75%) and document the methodology.
> - **Explicitly report the conflict to the orchestrator, including both values and their sources, without resolving it.** ✓
> - Omit the conflicting metric and proceed with the remaining analysis.

**Multiple-response** — *Context Management and Reliability*
> A team is debugging an agentic loop that sometimes terminates prematurely and sometimes spins through dozens of unproductive tool calls. The current implementation stops as soon as the assistant's response contains any plain text content, and separately hard-caps execution at 5 iterations regardless of `stop_reason`. Which two changes correctly align this loop with the intended pattern? *(select 2)*
> - **Stop checking for text content as a completion signal — a valid `tool_use` turn can legitimately include explanatory text alongside the tool call.** ✓
> - **Make `stop_reason === "end_turn"` the primary termination signal, while keeping a generous iteration cap in place as a safety-net fallback against runaway loops.** ✓
> - Replace the iteration cap with a token budget cap, since tokens are a more precise unit than turns.
> - Keep the text-content check but raise the iteration cap to 20 to reduce premature termination.

---

## Project structure

```
public/
  data/
    es/                   → Complete content in Spanish (source of truth)
      content.json        → Master collection index (ES)
      ejercicios.json     → The 4 solved practical exercises, in Spanish
      *.json               → One collection per file
    en/                   → English translation
      content.json        → Master index (EN) — lists translated collections/items
      exercises.json      → The 4 practical exercises, in English (not registered in content.json, same as its es/ counterpart)
      *.json               → One file per translated collection, with an English filename (e.g. introduccion.json → introduction.json)
  practice/
    index.html            → Standalone exam page (no dependency on the main bundle, English interface)
    examen_cca_f_en.json  → Pool of 265 exam questions, grouped by domain

src/
  App.jsx           → All UI, routing, state, and block renderers (~1060 lines)
  searchEngine.js   → Full-text search engine with scoring
  styles.css        → Tailwind directives + CSS custom properties for light/dark theme
```

The language switcher (ES/EN button in the top bar) toggles which folder (`data/es/` or `data/en/`) is used to fetch `content.json` and each collection. If a collection or sub-item has no equivalent file in `en/`, it **doesn't appear** in English mode — there's no silent fallback to Spanish and no placeholders.

---

## Stack

- **React 18** — UI
- **Vite 7** — Build tool and dev server
- **Tailwind CSS** — Utility styling
- **highlight.js** — Syntax highlighting for code blocks

No backend, no database, no build step for content: everything resolves by fetching static JSON at runtime, which makes adding or fixing content as simple as editing a file and refreshing the page.

---

## Adding content

1. Create or edit a JSON file in `public/data/es/` following the collection schema (see [CLAUDE.md](CLAUDE.md) for the full schema and per-file conventions) — Spanish is the source of truth, written there first.
2. Register it in `public/data/es/content.json`.
3. *(Optional)* Translate to English: create `public/data/en/<english-filename>.json` (the filename is translated too, never reuse the Spanish name) with the identical schema and structure (same `id`s, same block order), translating only text — never code, model IDs, or CLI flags. Register it in `public/data/en/content.json`. Skipping this step means that collection simply won't appear in English mode — that's expected behavior, not a bug.
4. No rebuild required — files load at runtime.

Before writing new content about the Claude Code CLI, Agent SDK, or MCP protocol, verify exact syntax against live documentation instead of recalling it from memory — see the technical-accuracy conventions in `CLAUDE.md`.

---

## License

[MIT](LICENSE) — free to use, modify, and distribute.
