<!--
  Good titles: imperative, scoped, searchable.
  Examples: "Fix seek overlay focus on Firefox", "Document bump workflow in README"
-->

## Summary

What does this change do, in plain language?

## Motivation

Why is it needed? Link issues when applicable (`Fixes #123`, `Closes #123`, or `Related to #123`).

## Test plan

How did you verify it? (manual steps, `bun run check`, targeted tests, etc.)

## Screenshots / recordings

Delete this section if there is no user-visible change.

## Notes for reviewers

Optional: trade-offs, follow-ups, or areas you want extra eyes on.

---

### Release & docs (user-visible behavior only)

Tick what applies. Leave unchecked items as-is so reviewers see the full list.

- [ ] **Docs** — `website/app/docs/*` (or other user-facing docs) updated if behavior changed.
- [ ] **Release notes** — item added to the current entry in `packages/constants/src/releases.ts` (or `version: "next"` as appropriate).
- [ ] **Features list** — new capability added to `FEATURES` in `packages/constants/src/features.ts` (and release note in `releases.ts`).
- [ ] **Version bump** — if this PR is the release, ran the repo bump script and `bun run check` is green (see `CLAUDE.md`).
- [ ] **Doc snapshot** — for minor/major releases, bump included `--snapshot` per `CLAUDE.md`.

### Assisted work (optional)

If AI or other automation helped implement or write this PR, briefly say what you personally reviewed, tested, or changed so reviewers can calibrate risk.
