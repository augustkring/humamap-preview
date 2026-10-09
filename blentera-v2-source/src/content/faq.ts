import { MessageCircleQuestionMarkIcon } from 'lucide-react'

import { siteConfig } from '@/config/site'

export type Faq = { question: string; answer: string }

// Plain strings, so the section and its FAQPage JSON-LD read one source. Backticks render as inline code.
export const faq = {
  eyebrow: { icon: MessageCircleQuestionMarkIcon, lead: 'Before You', emphasis: 'Clone It' },
  title: 'Questions & Answers',
  description: 'What ships in the starter, what it costs, and how it fits your stack.',
  contact: {
    title: 'Still have a question?',
    action: { label: 'Ask On GitHub', href: siteConfig.links.issues },
  },
  items: [
    {
      question: 'What is the 7Ovr Landing Starter?',
      answer:
        'A free, open-source Next.js 16 starter for landing pages, built on shadcn/ui and Base UI. Every page is prerendered, and every promise it makes, from SEO to accessibility, is covered by a test.',
    },
    {
      question: 'Is it free for commercial projects?',
      answer:
        'Yes. It is MIT licensed, so you can use it for client work and commercial products, and you owe nothing back. The Pro blocks and templates on 7Ovr are optional and separate.',
    },
    {
      question: 'What do I need installed?',
      answer:
        'Node 24 or newer and pnpm 12 or newer. There is no global CLI to install and no account to create.',
    },
    {
      question: 'What does tested mean here?',
      answer:
        'Each promise has a test: metadata and JSON-LD on every route, one h1 and working landmarks, readable HTML with JavaScript off, Lighthouse budgets, and noindex on preview deploys. CI runs them on every push, beside lint, format and type checks.',
    },
    {
      question: 'Does the page work without JavaScript?',
      answer:
        'Yes. Every section and every FAQ answer is in the server-rendered HTML. JavaScript only adds the theme toggle, the mobile menu, the copy button and the FAQ accordion.',
    },
    {
      question: 'Where do I change the copy?',
      answer:
        'Site-wide details live in `src/config/site.ts`, and the copy lives in `src/content/`, one file per section. The sections only render what they are given.',
    },
    {
      question: 'Does it include auth, a database or analytics?',
      answer:
        'No. It is a marketing site with no server code of its own. For an app, pair it with the 7Ovr Vite Starter; for a form or analytics, add your own.',
    },
    {
      question: 'How do I restyle it?',
      answer:
        'Build a preset on ui.shadcn.com/create and run `pnpm exec shadcn apply <code>`. Colors, radius and fonts all come from shadcn theme tokens, so every section follows.',
    },
    {
      question: 'Can I add 7Ovr blocks to it?',
      answer:
        'Yes. It is a standard shadcn/ui project, so all 540+ blocks install straight into it, source included: free ones with `pnpm exec shadcn add @7ovr/<name>`, Pro ones from `@7ovr-pro` with a license key.',
    },
    {
      question: 'Does it work with coding agents?',
      answer:
        'Yes. `CLAUDE.md` holds every convention and `AGENTS.md` points to it, so Claude Code, Codex and Cursor keep new pages and sections on the same patterns.',
    },
    {
      question: 'Where can I deploy it?',
      answer:
        'Vercel works with no setup. It is a standard Next.js app, so any host that runs `next start` works too; there, set `SITE_URL` and `SITE_ENV=production` before you build, so canonicals and indexing are right.',
    },
    {
      question: 'How do I keep it updated?',
      answer:
        'It is source you own, so nothing updates behind your back. Renovate keeps the dependencies current, and you pull in the upstream changes you want.',
    },
  ] satisfies Faq[],
}
