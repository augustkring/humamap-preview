# Contributing

Thanks for helping improve the 7Ovr Landing Starter. Bug reports, ideas and pull requests are all welcome.

## Before you start

- **Found a bug or have an idea?** [Open an issue](https://github.com/7ovr/shadcn-next-starter/issues/new/choose) first, as a Bug Report, Feature Request or Block Request. Search the existing issues before opening a new one.
- **Planning a larger change?** Open an issue to discuss it before writing code, so your time is not spent on something that will not be merged.
- **Found a security problem?** Do not open a public issue. Follow [SECURITY.md](SECURITY.md) instead.

## Set up

You need Node 24 or newer and [pnpm](https://pnpm.io) 12 or newer.

```bash
git clone https://github.com/<your-username>/shadcn-next-starter
cd shadcn-next-starter
pnpm install
pnpm dev
```

Fork the repository first, then clone your fork. `pnpm install` also sets up the Git hooks that format and lint your changes on commit.

## Make your change

Work on a branch named after the change, such as `fix/faq-answer-spacing` or `feat/changelog-page`.

[CLAUDE.md](CLAUDE.md) holds every convention in this repository, for people and coding agents alike. The ones that matter most:

- **Test logic, not rendering.** Write the test for the code that decides something, watch it fail, then make it pass. A bug fix starts with a test that reproduces the bug. Do not test that a component renders its copy or its links; what the built page shows belongs to the Playwright checks in `e2e/`.
- **The copy lives in `src/content/`.** Components render what they are given and never hard-code copy.
- **Follow the design system.** Theme tokens only, never raw colours or arbitrary values, and no `className` on shadcn/ui components: pick a variant and put layout on a wrapper. `@shadcn/lint` enforces this.
- **Keep `src/components/ui/` as the CLI writes it**, because applying a preset rewrites those files.
- **Keep every page's head in `createMetadata`**, and never hard-code the site URL.
- **Keep comments to one line**, only where the code cannot explain itself.
- **Title Case** for labels, such as headings, buttons and links, sentence case for FAQ questions, and **no em dashes** anywhere.

## Check your work

Run the same checks CI runs:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

`pnpm lint` fails on any warning. `pnpm test:e2e` builds the site and checks it in a browser; the first time, install the browser with `pnpm exec playwright install chromium`. CI also runs `pnpm test:e2e:preview` and `pnpm lighthouse`. Never skip the Git hooks with `--no-verify`.

## Commit

Commits follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `ci:` and so on. Write the subject in the imperative, as in `fix: keep the FAQ answers readable without JavaScript`, and keep each commit to one logical change.

## Open a pull request

1. Push your branch to your fork and open a pull request against `master`.
2. Describe what changed and why, and link the issue it closes.
3. Add screenshots for any visual change, in both light and dark mode.
4. Make sure CI passes. Workflows from forks run once a maintainer approves them.

The maintainer reviews every pull request and is the only one who can merge. Feedback may ask for changes; resolve each conversation before the pull request can be merged.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
