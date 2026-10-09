# CLAUDE.md

How to write code in this repository: conventions, patterns and constraints. Setup and scripts for people are in [README.md](README.md). This file is the single source of guidance for every agent; `AGENTS.md` points here.

## Constraints

- **Read the bundled Next.js docs first.** This is Next.js 16, whose APIs and conventions differ from older versions and from most training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code, and heed deprecation notices. `next.config.ts` sets `agentRules: false`, so `next dev` leaves `AGENTS.md` alone.
- **pnpm only.** Node 24 or newer, pnpm 12 or newer. Never use npm or yarn. Run one-off CLIs with `pnpm dlx`. `packageManager` in `package.json` pins the exact pnpm that CI, Vercel and other hosts install; raise it together with `engines`.
- **TypeScript 7**, strict. `any` is a lint error. Use `import type` for type-only imports (enforced). `next build` type-checks every file `tsconfig.json` includes, through the `tsc` CLI.
- **Oxlint and oxfmt.** Lint with Oxlint and [`@shadcn/lint`](https://github.com/shadcn-ui/lint), format with oxfmt. Do not add ESLint, Prettier or typescript-eslint: TypeScript 7 has no JavaScript compiler API, so typescript-eslint and `eslint-config-next` cannot run.
- **Fresh releases wait a day.** pnpm refuses versions published in the last 24 hours. Pick an older version or wait. Never add `minimumReleaseAgeExclude`.
- **Check dependency security before upgrading.** Audit direct and transitive dependencies, including development tooling, with `pnpm audit`. Do not accept an upgrade with known vulnerabilities or suppress advisories to pass the check. The maintainer has chosen to retain the shadcn CLI at exactly 4.21.3 despite its existing unpatched `braces` advisory; Renovate updates for it are disabled. Keep that hold until an upstream fix is available and verified. Use `pnpm exec shadcn` so commands respect the installed pin.
- **Renovate keeps dependencies current** (`renovate.json`). Updates are eligible every morning before 06:00 UTC. Stable minor and patch updates arrive in one grouped PR that merges itself once CI passes; majors and 0.x packages get their own PRs to review. It leaves the Node and pnpm versions in `engines`, `packageManager` and CI alone, and caps `@types/node` at the Node major; raise those by hand.

## Code conventions

- **kebab-case filenames**, such as `site-header.tsx`. Next's file conventions, like `page.tsx`, `not-found.tsx`, `opengraph-image.tsx`, `[slug]/` and `(group)/`, are the only exception.
- **Always import through the `@/` alias**, which maps to `src/*`. No relative imports.
- **Formatting** is oxfmt: 2-space indent, single quotes, trailing commas, 100-character lines, no semicolons. CSS keeps double quotes, the way the shadcn CLI writes it, so `shadcn apply` finds the imports it added before instead of adding them again. The pre-commit hook formats staged files; `pnpm format` does the whole repo.
- **Comments only when really necessary**, one line at most, and never a ticket or issue reference. Prefer a clearer name over an explanation.
- **No em dashes anywhere**: code, comments, UI copy, docs, commits and PRs. Use a plain hyphen or rephrase. The only exception is vendored third-party content, the installed skills in `.claude/skills/` and `.agents/skills/`, which we never hand-edit.
- **English only, in Title Case for labels**, capitalising every word: headings, titles, buttons, links, navigation, eyebrows, badges and the `aria-label` of a control, such as "Get The Starter". The buttons, badges and controls drawn inside an illustration take Title Case too. The hero headline is a full sentence and keeps sentence case, as do FAQ questions (asked the way a visitor would ask them), descriptions, captions, list items, status lines and FAQ answers. Write Title Case in the source, not with the CSS `capitalize` class, so the text people and screen readers get matches the screen.
- **Docs are for humans.** The README and other docs are written for people using, supporting or deploying the project: plain language, concise, easy to follow. Guidance for whoever writes code belongs in this file.
- **Commits** follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`). No `Co-Authored-By` lines in commits or PRs. Never bypass the hooks with `--no-verify`.

## Architecture

### Pages and content

- `src/app/layout.tsx` renders the skip link, `SiteHeader`, `<main id="main">` and `SiteFooter` around every page. `src/app/page.tsx` only lists the sections, in order.
- **Copy lives in `src/content/`**: one typed file per section, `navigation.ts` for the header and footer, and `not-found.ts` for the 404. Sections render what they are given and never hard-code words; only a control's own label, like `Open Menu`, sits beside the control. Site-wide details, like the name, description and links, live in `src/config/site.ts`.
- Backticks in a content string render as inline code through `withInlineCode` from `src/lib/inline-code.tsx`, and `stripInlineCode` gives the plain text for JSON-LD, so one string feeds both.
- **Every component lives flat in `src/components/`**, one kebab-case file each, sections and their parts included, such as `features.tsx` and `feature-visuals.tsx`. `src/components/ui/` is the only folder, and it holds what the shadcn CLI writes. Hooks live in `src/hooks/`, where the shadcn CLI puts them.
- **Build a section on `Section`** from `src/components/section.tsx`. It sets the shared padding, the `id` for in-page links and `aria-labelledby` for its `<h2>`. `SectionHeading` renders that `<h2>` with the eyebrow and description; `SectionTitle` and `SectionDescription` cover a layout it does not fit.
- Every page has one `<h1>` and never skips a heading level; card titles are `<h3>`.
- **The site URL is never hard-coded.** Read it with `getSiteUrl()` from `src/lib/site-url.ts`: `SITE_URL`, then Vercel's production domain, then localhost. Both `SITE_URL` and `SITE_ENV` are read at build time, and an indexed build with no public URL fails instead of pointing its canonicals at localhost.
- Screenshots live in `src/content/images/` and are imported statically, one per theme. Both render, with `dark:hidden` and `hidden dark:block`, and both stay lazy, because a lazy image that is not displayed never loads; `preload` or `loading="eager"` would load both. Decorative ones take `alt=""`.

### SEO

- **Every page's head comes from `createMetadata`** in `src/lib/metadata.ts`: title, description, canonical, Open Graph, Twitter and robots. Give every page but the home page a `title`, and always its `path`. The root layout sets only the defaults, with no canonical, so a page that skips `createMetadata` never claims to be the home page. The home page's title is `siteConfig.title`, kept near 60 characters, with the description near 155.
- **Only production is indexed.** `isIndexable()` in `src/lib/site-url.ts` lets in Vercel's production deploys and any host with `SITE_ENV=production`. Everything else gets noindex in the meta tag and in the `X-Robots-Tag` header; `robots.txt` always allows crawling.
- **Headers come from `responseHeaders`** in `src/lib/headers.ts`, which `next.config.ts` sends on every route: the security headers, a static CSP and, off production, `X-Robots-Tag`. Never a nonce CSP, because a nonce makes every page dynamic. The file imports nothing, since the config loader only resolves the `@/` alias in `next.config.ts` itself.
- `export const dynamic = 'error'` in the root layout makes a Request-time API anywhere fail the build, so every route stays prerendered.
- **Structured data is built from the content.** `src/lib/structured-data.ts` holds Organization, WebSite, SoftwareSourceCode and FAQPage, and FAQPage reads the same items the FAQ renders. Render it with `JsonLd` from `src/components/json-ld.tsx`, which escapes `<` so no string can close the tag. The FAQ section renders its own FAQPage, so the markup goes wherever the questions go.
- The icons come from the 7Ovr logo: `src/app/icon.svg`, `apple-icon.png` and `favicon.ico`. The brand images that JSON-LD, the manifest and the Open Graph image use sit in `public/brand/`.
- `src/lib/og.tsx` draws the Open Graph image at build time. Satori reads no CSS variables, so `src/lib/theme-tokens.ts` turns the light theme's tokens in `src/app/globals.css` into hex, and a preset restyles the card with the page. Its typeface is the `FONT` constant there. `.oxlintrc.json` exempts the file from `no-inline-styles` and `no-raw-colors`.

### Server first

- **Server Components by default.** The only client islands are the footer's theme toggle, the mobile menu's button, which imports its sheet on first use, or on a phone or tablet at the first scroll or touch, and holds it in state rather than behind Suspense, which would keep a freshly loaded sheet back for about 300 ms, the copy button and the logo's `HomeLink`, which scrolls back to the top on the home page, where a link to the current page would keep the scroll. Add `'use client'` only where a component needs state, effects or browser APIs, and keep that island as small as the interaction.
- **Everything a crawler needs is in the server HTML.** The FAQ keeps `hiddenUntilFound` on its `Accordion`: Base UI renders closed panels with `hidden` on the server and switches them to `hidden="until-found"` after hydration, and a `scripting: none` rule in `src/app/globals.css` shows every answer when JavaScript is off.
- **Testimonials, if you add them, stay plain quotes.** Never turn them into `Review` or `AggregateRating` markup; reviews a site publishes about itself do not qualify.
- **Links go through `SiteLink`** from `src/components/site-link.tsx`, which opens another site in a new tab and uses Next's `Link` for a page here. Style a link as a button with `ButtonLink` from `src/components/button-link.tsx`, which does the same and merges the variant classes through `cn`, as `Button` does. A bare `buttonVariants()` on a link keeps the transparent base border, so the outline variant loses its edge.

### Motion

- **Motion never gates content.** Entrances, scroll reveals and loops are CSS only (`animate-rise`, `animate-rise-fade`, `animate-float`, `animate-marquee` and `reveal` in `src/app/globals.css`), so the server HTML, the first client render and a page without JavaScript all match. Never start content at `opacity: 0` from JavaScript, and never branch rendered output on the reduced-motion setting.
- The headline uses `animate-rise`, which moves without fading, because the largest paint skips transparent elements.
- Put `motion-reduce:animate-none` beside every animation class. `reveal` needs nothing extra: it only runs where scroll timelines exist and motion is not reduced. Neither does `shimmer` from shadcn's stylesheet, which stops by itself.
- `reveal` only moves content into place and never fades it, so a heading that straddles the fold is never left half transparent. Keep it off the first screen anyway, where it would start mid-move.
- **Keep `filter` and `blur()` out of loops and scroll animations.** The browser repaints them on every frame instead of compositing them; only the hero entrance, which runs once, blurs into place.
- The stack marquee under the hero scrolls two copies of one list. The copy is `aria-hidden`, and under reduced motion it is hidden and the list wraps in place. The hero's floating tiles stay above it.
- The header turns to frosted glass on a scroll timeline in `header-glass`; without scroll timelines it is always glass.
- **Links jump, they never scroll smoothly.** An in-page link lands on its section at once, as on starter.7ovr.com, and `scroll-padding-top` keeps the heading clear of the sticky header. Do not add `scroll-behavior: smooth`, `data-scroll-behavior` or a smooth `scrollTo`; a Playwright check counts the scroll positions after a click.
- The illustrations loop gently through the utilities in the `Illustrations` block of `src/app/globals.css`, such as `animate-swap`, `animate-wave` and `animate-hop-rows`. Mockups are built from `Stage`, `MockCard`, `MockBar`, `MockButton` and `Swatches` in `src/components/mockup.tsx`. An element's own style is the finished frame, which reduced motion keeps. Items that take turns, like the routes in the build log, share one grid cell and wait at `opacity-0` until their delay.
- Decorative visuals, like the hero's floating logos, the CTA cards and the illustrations, are `aria-hidden` and `data-nosnippet`, so they stay out of screen readers and search snippets.

## Design system

`@shadcn/lint` checks Tailwind usage against the design system. All six rules are errors and gate CI: `no-restyle`, `no-raw-colors`, `no-arbitrary-values`, `no-unknown-classes`, `require-static-classes` and `no-inline-styles`. Keep the codebase at zero findings rather than downgrading a rule.

- **Theme tokens only, and only shadcn's own.** Every colour, radius and font comes from the tokens `shadcn init` writes into `src/app/globals.css`, so `pnpm exec shadcn apply <code>` restyles the whole site at once. A preset rewrites exactly those tokens, so never add a token of your own: it would keep its old value after a restyle. Derive a shade from an existing token instead, such as `bg-primary/10`. Shadows stay on Tailwind's default scale, like `shadow-sm`. Motion and effects are the exception, defined once in `src/app/globals.css` as keyframes and `@utility` rules.
- **Keep `src/components/ui/` as the CLI writes it.** `shadcn apply` overwrites those files when it applies a preset, so a variant added there would be lost. The linter ignores the folder, because those files define the variants the rules enforce.
- After `shadcn apply`, run `pnpm format`. When the preset changes a font, the CLI adds the new one to `src/app/layout.tsx` and keeps the old one, so remove the font it replaced: its import, its `const` and its classes on `<html>`. Change `FONT` in `src/lib/og.tsx` to match. The starter's own look is preset `b4Wm`.
- Blocks installed from the 7Ovr registry land in `src/components/blocks/`, the one folder `.oxlintrc.json` relaxes the design-system rules for, because registry code arrives with its own classes. Keep your own components out of it.
- **`no-restyle` runs with no allowlist**: a shadcn component accepts no `className` from outside, not even layout or margin. Pick one of the variants it already has, and put layout classes on a plain wrapper element around it.
- Brand marks live in `src/components/icons.tsx`: full-colour logos in each brand's own colours for the floating tiles, and single-colour marks that follow the text colour for the marquee, so `.oxlintrc.json` exempts that one file from `no-raw-colors`. The 7Ovr wordmark in `src/components/logo.tsx` loads Syne through `next/font` for itself alone, so a preset's font change leaves the brand as it is.
- Base UI takes `render`, not `asChild`.
- Add shadcn components with `pnpm exec shadcn add <name>`, then run `pnpm format`, because the CLI writes double quotes.

## Tests

- **Test logic, not rendering.** Unit tests cover code that decides something: the site URL resolver, the metadata and response headers, the theme token converter, the JSON-LD escape, the inline-code parser, the content rules, the copy button's clipboard handling and how `SiteLink` treats a URL. Do not write a test that a component renders its copy, its links or its markup; the page's structure belongs to the Playwright checks in `e2e/`.
- **Tests come first** for that logic. Before writing it, write the test that describes it and watch it fail. A bug fix starts with a test that reproduces the bug.
- **Colocate tests** with the file they cover: `copy-command.test.tsx` sits next to `copy-command.tsx`.
- **Do not test shadcn/ui or Base UI primitives.** They are vendored and tested upstream.
- Vitest with Testing Library in jsdom. When a test needs the DOM, query by role and label, the way people use the page.
- `src/test/setup.ts` mocks `next/font/google`, which only runs inside the Next compiler, and stubs the browser APIs jsdom lacks. Add to it when a component needs another one.
- `src/content/content.test.ts` enforces the copy rules: no em or en dashes, Title Case labels, and FAQ questions asked as sentences.
- **Playwright checks the built site** from `e2e/`. `playwright.config.ts` builds the site and serves it as a production deploy for `pnpm test:e2e`, or as a preview for `pnpm test:e2e:preview`, and the specs read which from `E2E_PREVIEW`. They cover what a visitor and a crawler get: the head, the JSON-LD against the page, headings, landmarks and the skip link, the page with JavaScript off, the crawler files, the headers, hydration with and without reduced motion, the header's fit from a tablet up, and the interactive islands. A new page or section adds its checks there, and a new header link must still fit beside the logo and the action at `lg`, where the links appear.
- **Lighthouse budgets** live in `lighthouserc.json`: the desktop preset, the median of three runs, at least 90 for performance, 95 for accessibility and best practices and 100 for SEO, with LCP under 2.5 s, CLS under 0.1 and TBT under 200 ms. When a budget fails, fix the page rather than the budget.

## Skills

Skills for agents working here live in two identical folders: `.claude/skills/` for Claude Code and `.agents/skills/` for every other agent. They are `vercel-react-best-practices`, `vercel-composition-patterns`, `shadcn` and `improve`, the same set as the 7Ovr Vite Starter, pinned in `skills-lock.json`.

- Add or update a vendored skill for both folders at once, as real files: `pnpm dlx skills add <repo> --skill <name> --agent claude-code universal --copy`. Never hand-edit vendored skills.

## Before you finish

Run `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm build`, and `pnpm test:e2e` when a change touches what a page renders or sends. `pnpm lint` fails on any warning, so the codebase stays at zero findings. CI runs all of them on every pull request and every push to `master`, with `pnpm test:e2e:preview` and `pnpm lighthouse` beside them.
