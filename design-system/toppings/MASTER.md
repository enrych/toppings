# Toppings — Design System (Master)

> **Status:** v1 — covers the marketing website + extension UI.
> **Last updated:** 2026-05-14
>
> This file is the **Global Source of Truth**. Any component, page, or surface
> must conform unless it has an explicit override in `pages/[page].md`.

---

## 1 · Brand at a glance

**Toppings** is a browser extension that lets people customize YouTube — audio
mode, custom playback rates, loops, Shorts auto-scroll. The product is small,
considered, free, and open source.

The design language is **warm minimalism**. Generous whitespace, oversized
editorial typography, one brand accent (amber). Restraint is the brand —
when something is colorful, it should feel intentional, not decorative.

**Voice:** confident, calm, technical when it needs to be. Never excited.
Sentences are short. We say what the thing is, then we get out of the way.

**Anti-patterns we explicitly avoid:**
- Rainbow gradients (violet + rose + amber + blue all on the same page)
- Multi-tone feature cards where each card has its own brand color
- Emoji as UI icons
- Stacked CTAs (one primary CTA per section, max)

---

## 2 · Color tokens

The brand operates on **four** tokens. Everything else is a derived alpha.

| Token | Hex / RGB | Role | Tailwind utility |
|---|---|---|---|
| `cream` | `#FFF9EF` · `rgb(255 249 239)` | Page background | `bg-cream` `text-cream` |
| `ink` | `#0A0A0A` · `rgb(10 10 10)` | Text, surfaces in inverse sections | `bg-ink` `text-ink` |
| `amber` | `#FCA929` · `rgb(252 169 41)` | **Single brand accent.** Used sparingly. | `bg-amber` `text-amber` |
| `flame` | `#F57C20` · `rgb(245 124 32)` | Hot-accent for hover, never as a primary fill | `bg-flame` `text-flame` |

**Text contrast guarantees (WCAG AA):**

| Pairing | Use for | Contrast |
|---|---|---|
| `text-ink` on `bg-cream` | Body | 17:1 ✓ |
| `text-ink/65` on `bg-cream` | Secondary body, captions | 9:1 ✓ |
| `text-ink/45` on `bg-cream` | Microcopy, labels | 4.7:1 ✓ |
| `text-cream` on `bg-ink` | Inverse body | 17:1 ✓ |
| `text-cream/65` on `bg-ink` | Inverse secondary | 9:1 ✓ |
| `text-amber` on `bg-cream` | **Avoid for body text.** Eyebrows only. | — |
| `text-amber` on `bg-ink` | Inverse eyebrow / accent | ≥4.5:1 ✓ |

**Status tones** (only on the extension UI, never on the marketing site):

| Tone | Foreground | Background |
|---|---|---|
| success | `#86efac` (dark) / `#15803d` (light) | 10% tint of fg |
| danger | `#fca5a5` (dark) / `#b91c1c` (light) | 10% tint of fg |
| info | `#93c5fd` (dark) / `#1d4ed8` (light) | 10% tint of fg |
| warning | `#fde047` (dark) / `#a16207` (light) | 10% tint of fg |

These come from `web-ext/src/shared/theme.css`. The marketing site does not
use them — its tonal needs are met by `ink`/`cream`/`amber` alone.

---

## 3 · Typography

**Family:** `Inter` (single family, variable weight). Self-hosted via
`next/font/google` in `website/app/layout.tsx`.

**Mood:** minimal, Swiss, functional, neutral.

**Scale (display / heading / body):**

| Class | Size | Weight | Tracking | Use for |
|---|---|---|---|---|
| `.text-display` (h1) | `clamp(56px, 8vw, 104px)` | 900 | `-0.04em` | Hero & section opener |
| `h2 editorial` | `clamp(40px, 6vw, 72px)` | 900 | `-0.03em` | Big section heads |
| `h2 default` | `clamp(28px, 3vw, 36px)` | 700 | `-0.02em` | Standard section heads |
| `h3` | `18px–22px` | 600 | `-0.01em` | Subsection / card title |
| `body lg` | `18px` | 400 | `-0.005em` | Lead paragraph |
| `body` | `15px–16px` | 400 | 0 | Default copy |
| `body sm` | `13px–14px` | 500 | `0.01em` | Microcopy |
| `eyebrow` | `11px` | 600 | `0.22em uppercase` | Section labels in `text-amber` |
| `mono` | `12px–13px` | 500 | 0 | Keys, code snippets |

**Line-height:** body 1.55, headings 0.92–1.0. **Line length:** body capped at
~65ch (`max-w-xl` in tailwind).

**The `.amber-underline` highlighter** (defined in `globals.css`) is the only
decorative typography effect on the marketing site. Apply it to **one** word
per headline — never more — to draw the eye to the brand promise. Example:
"Your YouTube, **<u>Your way</u>**."

---

## 4 · Layout

- **Max container width:** `max-w-7xl` (1280px). Hero is allowed `max-w-7xl`
  with an asymmetric 12-col grid (6/6 or 7/5).
- **Horizontal padding:** `px-6` on mobile, `px-8` on lg.
- **Vertical rhythm:** sections are `py-24 lg:py-32` for marketing,
  `py-16 lg:py-20` for the "strip" sections (marquee, stats).
- **Card radius:** `rounded-3xl` (24px) for feature cards, `rounded-2xl`
  (16px) for the player mockup, `rounded-full` for CTA buttons & chips.
- **Borders:** prefer `border-ink/[0.06]` to `0.10`. Never use sharp black
  borders on cream.

---

## 5 · Components — usage rules

### Hero
- Big editorial headline. **One** word in `amber-underline`.
- Single primary CTA (the magnetic install button). A secondary text link is
  permitted ("Star on GitHub"). **No more than two CTAs in the hero.**
- Right column carries a product mockup or single hero visual. No decorative
  blobs of more than one tone.

### Navbar
- Sticky, transparent over hero, fades to `bg-cream/85 backdrop-blur` on
  scroll. **No gradients.** No drop shadow beyond a single hairline border
  (`border-b border-ink/[0.06]`).
- Logo: pizza-slice icon + `Toppings` wordmark in **Inter 700** at
  `text-lg–text-xl`. No display fonts in the nav.
- Right side: 1–2 text links (`Wiki`, `Sponsor`) + 1 install CTA.

### Footer
- Dark (`bg-ink text-cream`) so the page closes on the brand's inverse note.
- Logo + tagline + 4-link column. **No** image / decorative panels.

### Player mockup (`PlayerMockup`)
- Ink-colored frame, white window controls, `text-cream` content.
- Single amber accent on: progress bar + active mode chip.
- Visualizer mode is white-on-black (AM aesthetic) — **never** rainbow.
- Custom mode background uses an amber radial fading to ink, not a
  multi-color gradient.

### Vinyl scene (`VinylScene`)
- Pure canvas (no three.js / r3f). Disc is `ink`, label is `amber`, sheen is
  white at low opacity. Soft amber halo behind. Cursor-driven tilt for the
  sense of depth.

### Feature cards (`FeatureCard`)
- Cream / white surface, `border-ink/[0.06]`.
- Icon tile is `bg-ink text-cream`, swapping to `bg-amber text-ink` on hover.
- Hover glow is a single amber radial; **never** per-card tonal variation.
- Cursor-tilt is subtle (≤5deg). Drop the tilt if motion-reduced.

### Sections / page rhythm
1. Hero
2. Shortcut marquee (subtle social proof, no color)
3. Audio Mode showcase (`bg-ink`, the inverse section — the only one)
4. Features grid (cream)
5. Stats strip (cream)
6. How it works (cream)
7. Final CTA (cream)

The page goes **cream → cream → ink → cream → cream → cream → cream**. One
inverse section, never more.

---

## 6 · Motion

- Library: `framer-motion`.
- Easing default: `[0.22, 1, 0.36, 1]` (smooth ease-out, "expo-out").
- Durations: 200–250ms micro, 500–700ms entrance, 14–40s ambient
  (marquee, vinyl rotation).
- Springs: `{ stiffness: 200, damping: 22 }` is the canonical "tilt / drag"
  setting. Magnetic CTA uses a softer `{ stiffness: 220, damping: 18 }`.
- **`prefers-reduced-motion`** is honored globally via the CSS rule in
  `globals.css`. New animations don't need extra guards.

---

## 7 · Iconography

- **Source:** Heroicons + custom inline SVGs sized to a 24×24 viewBox.
- **Never** use emoji as a UI icon. The single decorative `✦` glyph in the
  Audio Mode eyebrow is permitted as typography, not an icon.
- Icon sizing: 16px in chips and labels, 20px in cards, 24px in section heads.
- Stroke icons: `currentColor`, 2px stroke. Filled icons: `currentColor` fill.

---

## 8 · Accessibility checklist (pre-merge)

- [ ] Body text ≥ 4.5:1 contrast on its surface
- [ ] All interactive elements have `cursor-pointer` and a visible focus ring
- [ ] Icon-only buttons have `aria-label`
- [ ] All images have meaningful `alt` text or `alt=""` for decorative
- [ ] All form inputs have a `<label htmlFor>` or `aria-label`
- [ ] Tab order matches visual reading order
- [ ] `prefers-reduced-motion` removes non-essential animation
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Responsive at 375 / 768 / 1024 / 1440 with no horizontal scroll

---

## 9 · Anti-patterns (reject in code review)

| ❌ Don't | ✅ Do |
|---|---|
| Use rose, violet, blue, green as decorative gradients | Stick to ink + cream + amber |
| Per-card tonal variation in feature grids | One monochrome system, amber on hover |
| Banner-style gradient CTAs with multiple stops | Solid ink button with amber dot |
| Stacked or duplicated primary CTAs in one section | One primary, optional secondary text link |
| `tw-bg-[#hex]` hardcoded hex values in components | Reference `bg-cream`, `bg-ink`, `bg-amber` |
| Emoji icons | Inline SVG / Heroicons |
| Scale-on-hover that shifts layout | Color/opacity transitions only |

---

## 10 · Files of record

| Concern | File |
|---|---|
| Marketing color tokens | `website/app/globals.css` |
| Marketing tailwind config | `website/tailwind.config.ts` |
| Extension theme tokens | `web-ext/src/shared/theme.css` |
| Extension tailwind config | `web-ext/scripts/build.js` (inline) |
| Shared components | `web-ext/src/shared/components/` |
| Feature registry | `web-ext/src/shared/features.ts` |
| Maintainer notes (extension) | `web-ext/CLAUDE.md` |
