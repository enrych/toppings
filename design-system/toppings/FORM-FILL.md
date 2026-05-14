# Claude Design — form-fill cheat sheet

Copy/paste these directly into the "Set up your design system" form.

---

## Field: Company name and blurb

```
Toppings — a free, open-source browser extension that gives people total
control over YouTube. Audio Mode for listening without the visuals, custom
playback rates, loop segments, Shorts auto-scroll, playlist runtime stats.
Small, considered, and intentionally restrained — warm minimalism, oversized
editorial typography, one amber accent on a cream page.
```

---

## Field: Link code on GitHub

```
https://github.com/enrych/toppings
```

(Branch with the current revamp: `claude/exciting-keller-a18866`. The marketing
site lives under `/website`, the extension under `/web-ext`, and the shared
design tokens live in `web-ext/src/shared/theme.css` + `website/app/globals.css`.)

---

## Field: Link code from your computer

Not needed if you give it the GitHub link, but if you do attach locally,
hand it the frontend-focused subfolders:

```
/Users/greenstitch/Developer/toppings/website
/Users/greenstitch/Developer/toppings/web-ext/src/shared
/Users/greenstitch/Developer/toppings/design-system
```

---

## Field: Upload a .fig file

Skip — no Figma file. The design system lives in the `design-system/toppings/MASTER.md`
attached above and is implemented in code.

---

## Field: Add fonts, logos and assets

Attach these from the repo:

| File | Why |
|---|---|
| `website/assets/icons/icon512.png` | Primary brand logo (pizza slice, 512px PNG) |
| `website/assets/icons/toppings.svg` | Vector wordmark / icon |
| `web-ext/src/assets/icons/icon128.png` | Small extension icon (toolbar tile) |
| `design-system/toppings/MASTER.md` | The actual design system spec |

**Fonts:** `Inter` (Google Fonts), variable weight 300–900. Used via
`next/font/google` — no font file to upload.

---

## Field: Any other notes?

```
Brand language is "warm minimalism." Four tokens only: cream (#FFF9EF) page
background, ink (#0A0A0A) text and inverse surfaces, amber (#FCA929) as the
single brand accent used sparingly, and flame (#F57C20) as a hot-accent for
hover states. No rainbows. No per-feature tonal variation. One section in
the marketing flow is inverse (ink); the rest is cream.

Typography is Inter only, but weight 900 with -0.04em tracking for an
oversized editorial display feel. The lone decorative effect is a yellow
highlighter behind a single word per headline (`.amber-underline` in
globals.css) — never more than one word, never more than one headline at a
time.

Motion uses framer-motion. Default ease is the "expo-out" cubic
[0.22, 1, 0.36, 1]. prefers-reduced-motion is honored globally.

Voice: confident, calm, technical when needed. Short sentences. We say what
the thing is and get out of the way.

The product is a browser extension, so the design system covers two surfaces
that need to feel like the same brand: the marketing site (cream + amber +
ink editorial style) and the extension UI itself (themable dark/light using
the same tokens via shared CSS variables).
```

---

## Components currently breaking / not matching (TODO after design-system lock-in)

Per the user's note in this thread, the next things to bring in line with the
spec above:

- **Navbar** — still uses the legacy display font (Akronim) and shadow style;
  must move to Inter 700 wordmark with a hairline border-only chrome.
- **Footer** — uses an external logo (`enry.ch`), needs to be reworked into
  the dark inverse footer described in MASTER §5.
- **CallToAction component** — the legacy button styled with `hsl(var(--primary))`
  shadcn pattern doesn't match the new ink/amber magnetic CTA.
- **PlayerMockup** — confirm visualizer canvas is white-on-black only and
  custom-mode background is amber-radial-to-ink (no multi-color).
- **VinylScene** — verify center label color matches `amber` token exactly,
  not a one-off hex.
