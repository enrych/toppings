# AGENTS.md

Single source of truth for any coding agent working in this repo: Claude Code, OpenAI Codex CLI / Codex Cloud, Google Gemini CLI, Google Antigravity, Cursor, Windsurf, opencode, Aider, goose, Factory, RooCode, JetBrains Junie, GitHub Copilot, Devin, or any other AGENTS.md-aware tool.

This file holds the rules that apply **everywhere in the repo**. Anything that applies to only one project lives in a scoped file under `AGENTS/`.

---

## 0. HOW TO USE THIS FILE

1. Read this file in full. It is short on purpose.
2. Identify which project your task touches.
3. Read that project's scoped file from the table below, in full, before editing.
4. Root rules and scoped rules both apply. If they conflict, the scoped file wins for files inside its directory.

---

## 1. SCOPE MAP

| You are touching | Read this too | What it is |
| --- | --- | --- |
| `web-ext/` | [`AGENTS/web-ext.md`](AGENTS/web-ext.md) | Chrome/Firefox extension for YouTube |
| `website/` | _(not written yet — root rules only)_ | Next.js marketing and docs site |
| `backend/` | _(not written yet — root rules only)_ | Cloudflare Workers API |
| `assets/` | _(none)_ | Brand assets |

Write a scoped file when a project accumulates rules of its own — not before. A scoped file that only restates the root is noise.

---

## 2. COMMENTS

**Read this section as a hard rule, not a preference.**

Clean code reads as its own explanation. Function names, execution order, variable names, and type signatures tell the reader *what* the code does and *how* it does it. A comment that repeats any of those is duplicated logic — it rots the moment the code moves, and it trains readers to stop trusting comments. A codebase dense with comments is evidence that the code failed to explain itself.

### The only comment worth writing

A comment earns its place when it captures **why the code is the way it is** — a decision, constraint, or external cause the code itself cannot state:

- A workaround for someone else's bug or quirk (YouTube DOM behaviour, a Chrome API footgun, a browser difference).
- A deliberate tradeoff and its ceiling — why the slow/simple approach was chosen and when it stops being good enough.
- A non-obvious ordering or timing requirement that looks arbitrary and invites "helpful" reordering.
- A rule imposed from outside the code: a store policy, a spec, a manifest requirement.

If you cannot finish the sentence "this looks wrong/arbitrary unless you know that…", you do not have a why. Delete it.

### Before writing any comment, do this instead

1. **Rename.** Most explanatory comments are a variable or function asking for a better name.
2. **Extract.** A comment labelling a block is that block asking to be a named function.
3. **Reorder.** A comment explaining sequence is usually a sequence that should read top-to-bottom on its own.

Only when all three fail, and the missing information is a *why*, write the comment.

### Never write

- Restatement: `// increment the counter`, `// loop over items`, `// returns the user`.
- Section banners and ASCII dividers.
- JSDoc that repeats the signature — no `@param` / `@returns` that TypeScript already states. A doc block is allowed only when its body is a *why*.
- Changelog, attribution, dates, ticket numbers, or "changed by" notes. That is git's job.
- Commented-out code. Delete it; git remembers.
- `TODO` / `FIXME` without a tracked issue link. Untracked ones are never done.
- Narration of your own edit: `// added this to fix the bug`, `// new logic`.

### Form

One or two lines, plain prose, directly above what it explains. No trailing end-of-line commentary except where a single value genuinely needs a unit or source note.

### When you touch existing code

The repo predates this rule and still carries comments that break it. Do not launch a repo-wide comment sweep unless asked. Do apply the rule to every line you are already editing: if you are modifying a function, its restating comments go with the edit. Leave unrelated files alone.

---

## 3. UNIVERSAL RULES

- **Smallest diff that works.** Do not restructure files you were not asked to change. Do not add abstractions for a second caller that does not exist yet.
- **Delete over add.** Removing dead code is a complete contribution.
- **Match the surrounding file** in naming, import ordering, and idiom, even where it differs from your own preference.
- **No new dependencies** for something a few lines of platform or standard-library code already do. If a dependency is genuinely needed, say why before adding it.
- **Never commit unless asked.** When asked, stage only the files your task touched — the working tree often carries unrelated in-progress work. No `Co-Authored-By` or agent-attribution trailers.
- **Verify before claiming done.** Run the project's type-check or test command and report what it actually printed, including pre-existing failures you did not cause.

---

## 4. AGENT-COMPATIBILITY NOTES

- **Nested AGENTS.md.** If a sub-project adds its own `AGENTS.md`, the closest one wins for files inside that sub-project. The `AGENTS/` scoped files are the preferred mechanism; use nesting only when a tool requires it.
- **CLAUDE.md** at the repo root is a pointer to this file (`@AGENTS.md`). Keep rules here, not there.
