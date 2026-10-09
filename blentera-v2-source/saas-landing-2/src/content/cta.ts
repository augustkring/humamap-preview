import { AppWindowIcon, EyeOffIcon, FileCheckIcon, GaugeIcon, type LucideIcon } from 'lucide-react'

import { siteConfig } from '@/config/site'

export const cta = {
  eyebrow: { lead: 'Open Source,', emphasis: 'MIT Licensed' },
  title: 'Start On The Words, Not The Setup',
  description:
    'Clone the starter, make the words yours and deploy. Speed, SEO, accessibility and theming are already done, and the tests keep them that way.',
  primaryAction: { label: 'Get The Starter', href: siteConfig.links.repository },
  secondaryAction: { label: 'Use This Template', href: siteConfig.links.template },
  cards: [
    { icon: FileCheckIcon, title: 'sitemap.xml', detail: 'Every route, with real dates' },
    { icon: GaugeIcon, title: 'Lighthouse', detail: 'Budgets checked in CI' },
    { icon: AppWindowIcon, title: 'Playwright', detail: 'The built site, tested in CI' },
    { icon: EyeOffIcon, title: 'Preview Deploy', detail: 'noindex, still crawlable' },
  ] satisfies { icon: LucideIcon; title: string; detail: string }[],
}
