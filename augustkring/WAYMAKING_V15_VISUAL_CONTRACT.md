# Waymaking V15 — Visual Contract and Verification Plan

Date: 2026-10-21. Status: independent implementation candidate; NOT approved until actual viewport screenshot and motion sequence validation.

## Exact approved experience
An organically curving, hand-drawn high-resolution road progressively EXPANDS and lengthens with native vertical scrolling. The road is visually anchored in a single sticky scene while Creative Thinking, Commercial Understanding, Strategic Judgment, AI-Native Building, and Purpose Driven pass beside it in that order. Each successive chapter must expose a strictly longer portion of the road. The road must not pop in late, jump, be drawn once then stop, move bodily down the document, overlap readable text, sit in an opaque rectangular image/card, or appear pixellated. First chapter begins at the top of the road, without an empty intro spacer. Natural spacing connects the last chapter to the final Waymaker statement and then to My current focus.

## Research and design decision
- SVG vector curves, explicit authored brush-edge paths and a continuous stroke mask give scale-independent output without rasterization. The mask's stroke-dashoffset is proportional to the real geometric path length (getTotalLength); no filter animation or painted WebP upscaling. Reference: MDN pathLength/stroke-dashoffset.
- Native sticky artspace and normal document text flow avoid JavaScript-driven road positioning, extra scroll capture, and layout jumps. Reference: MDN position:sticky.
- Native scroll plus rAF with reading-position progress retains deterministic scrub and reversibility with no third-party runtime dependency. GSAP ScrollTrigger documents an alternative pin/scrub workflow, but it is unnecessary for this single self-contained story.
- Separate responsive vector artwork is genuinely recomposed for the narrow mobile side rail; never zoom/crop an unrelated desktop bitmap. Road is decorative aria-hidden; heading content stays in semantic HTML.
- Reduced motion uses a complete static road with normal scrolling. No-JS loads the full SVG and unmodified semantic chapter copy. Reference: W3C WCAG 2.3.3, 1.4.10.

## Acceptance / falsification
1. Actual measured road mask draw fraction strictly increases across all five chapter centers (and decreases on reverse scroll); road position remains stable while the five chapters pass.
2. 320 / 390 / 768 / 1024 / 1440px screenshot sets: first heading starts near drawing start, no text/road overlap, no visible square canvas, no pixellation; mobile remains 100% readable.
3. No imposed pre-story or 70–100svh post-story spacers; the last heading flows into the Waymaker line with natural visible spacing.
4. Three engines: Chromium, Firefox, WebKit, including reduced motion, no-JS and viewport resizing.
5. At later sections, no road pixels remain visible; JS logs free of errors; no horizontal overflow; keyboard and text enlargement are unharmed.
6. Visual screenshots AND progress checkpoints are mandatory release evidence. Passing CSS-property assertions alone is insufficient.
