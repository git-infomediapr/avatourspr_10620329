# DESIGN.md - AVA Tours

## Context (from discovery)

- Artifact type: marketing / landing page (single-page, anchor navigation)
- Positioning: corporate travel wholesale, trustworthy, Puerto Rico rooted
- Audience: travelers via affiliated agencies in PR | Primary action: call AVA Tours or contact an allied agency
- Adjectives: immersive, trustworthy, adventurous, clear, warm
- Visual word translations:
  - immersive -> full-bleed hero photography, dark overlay, cinematic motion
  - trustworthy -> structured sections, clear contact paths, municipal agency map
  - adventurous -> warm travel imagery, bold display type, red AVA accent
  - clear -> airy section rhythm, one job per section, no form clutter
  - warm -> sepia-leaning photo treatment feel, human destinations
- Aesthetic essence: immersive, bold, editorial
- Single-minded proposition: AVA Tours opens the door to travel through a trusted Puerto Rico wholesale network
- Archetype: Explorer + Caregiver
- References: admire immersive travel heroes with left-locked copy and sticky transparent headers; avoid purple SaaS kits and booking-widget clutter (brief forbids forms)
- Mode: light sections + dark hero/footer | Density: airy marketing
- Constraints: Astro + Tailwind v4 + React only for MapLibre; no contact forms; Lenis + GSAP; brand scales Monza / Cod Gray / Alabaster; logo/favicon from `/public`

## Aesthetic

- Direction: Immersive travel editorial (reference layout transposed to AVA content)
- Defining trait: Full-bleed photo plane + sticky glass-to-solid header + left-locked hero copy
- Signature move: Transparent header with hairline `border-white/20` that snaps to solid white + shadow on scroll; active nav marked by a vertical red bar; hero cursor water-ripple (WebGL) with subtle AVA-red tint

## Typography

- Display + body: Plus Jakarta Sans (Google Fonts, OFL) — geometric sans, not Inter
- Scale: ratio ~1.25, base 16px
- Weights: 400 / 500 / 700 / 800
- Hero title: extrabold to black, 3.75rem → 6rem
- Section titles: extrabold ~2.25rem
- Measure: ~65ch for about copy

## Color

- Strategy: Full brand scales in `@theme` — use steps intentionally; avoid indigo/violet AI defaults
- Scales (`src/styles/global.css`):
  - **Monza** (brand red): `50`–`950`; default accent `monza-600` `#d31224`; hover `monza-700`; soft tint `monza-50`
  - **Cod Gray** (ink): `50`–`950`; body/headings `cod-gray-900` / `cod-gray-950`; muted `cod-gray-600`–`700`; footer `cod-gray-950`
  - **Alabaster** (surfaces): `50`–`950`; section surface `alabaster-50`; borders `alabaster-200`
- Defaults: accent-fg white; page bg white; hero overlay `black/45`

## Spacing, radius, shadow

- Spacing base: 8px rhythm; tight within groups, generous between sections (py-20 / py-24)
- Radius: `rounded-lg` cards, `rounded-2xl` about image, `rounded-full` CTA pill
- Shadow: soft elevation on scrolled header and service cards (`shadow-md` / `hover:shadow-xl`)

## Layout and composition

- Grid: 12-col feel via Tailwind max-w-7xl; about 50/50; services 1/2/4; agencies sidebar + map
- Signature layout move: Hero content anchored lower-left over edge-to-edge photo; header nav centered like the reference
- Scanning: F-pattern on hero, then section stacking

## Motion

- Lenis smooth scroll (lerp ~0.08), synced to GSAP ticker + ScrollTrigger
- Hero entrance: media settle → headline → subtitle → CTA (power3/power4.out)
- Section reveals: fade-up once at `top 82%`
- Hero parallax: background image slow scrub
- Respect `prefers-reduced-motion`: no Lenis, instant visibility

## Components

- Header sticky: transparent → white on scroll; mobile hamburger
- CTA primary: red pill phone link
- Service cards: white on `alabaster-50`, lucide icons in `monza-50`/`monza-600`, hover shadow
- Agencies: React MapLibre map + scrollable list; pin click ↔ card focus
- BackToTop: fixed bottom-right arrow (replaces WhatsApp floater)
- No contact forms

## Imagery

- Pexels travel photography (ocean/adventure hero, destination about)
- Warm grade via overlay; real places over abstract blobs
- Hero LCP: `fetchpriority="high"`, no lazy

## Accessibility

- WCAG 2.2 AA targets; visible focus; 24px+ hit areas; reduced-motion path; semantic landmarks; map markers keyboard-adjacent via list

## Slop audit

- Avoided: Inter, purple gradients, cream/serif AI look, booking widget, hero cards, form spam
- Pass: brand-first hero (AVA Tours), one composition first viewport, red accent system, cinematic motion restraint
