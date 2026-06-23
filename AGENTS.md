# AGENTS.md

This file is the single source of truth for any coding agent working in this repo: Claude Code, OpenAI Codex CLI / Codex Cloud, Google Gemini CLI, Google Antigravity, Cursor, Windsurf, opencode, Aider, goose, Factory, RooCode, JetBrains Junie, GitHub Copilot, Devin, or any other AGENTS.md-aware tool.

Read this file in full before taking any action. Obey it exactly.

---

## 0. TLDR FOR THE AGENT

On every session start, do this in order:

1. Read this file completely.

---

## 1. WHAT THIS REPO IS

The extension lives in `web-ext/`, the marketing and docs site in `website/`, and the Cloudflare Workers API in `backend/`.

## 2. PROJECT CONTRACT

### 2.1 Repo layout

```text
.
├── AGENTS.md                         # You are here
├── README.md                         # Readme file for the repo
├── assets/                           # Brand assets
├── web-ext/                          # Browser extension
├── website/                          # Marketing and docs site
└── backend/                          # Cloudflare Workers backend
```

---

## 3. CROSS-PLATFORM AND AGENT-COMPATIBILITY NOTES

- **Nested AGENTS.md.** If a sub-project adds its own AGENTS.md, the closest one wins for files inside that sub-project.

---

## 4. QUICK CHECKLIST FOR THE AGENT

Before you respond to any user message, confirm:

- [ ] I have read this file in this session.

If any box is unchecked, fix that first.
