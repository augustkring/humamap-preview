const repository = 'https://github.com/7ovr/shadcn-next-starter'

// Tags links to the rest of 7Ovr, so their analytics credit the visit to this site.
function referral(url: string): string {
  const tagged = new URL(url)
  tagged.searchParams.set('utm_source', 'landing')
  tagged.searchParams.set('utm_medium', 'referral')
  return tagged.toString()
}

export const siteConfig = {
  name: '7Ovr Landing Starter',
  // The search result title and snippet, kept near 60 and 155 characters so neither truncates.
  title: 'Next.js Landing Page Template With shadcn/ui',
  description:
    'A free, open-source Next.js landing page template on shadcn/ui and Base UI, with static pages, complete SEO, accessibility, theming and tests wired.',
  // The share image's line under the headline.
  tagline: 'Static pages, complete SEO, accessibility, preset theming and tests, wired.',
  keywords: [
    '7Ovr',
    'Next.js landing page template',
    'Next.js landing page starter',
    'shadcn/ui landing page',
    'shadcn/ui template',
    'Next.js template',
    'landing page template',
    'Base UI',
    'Tailwind CSS',
  ],
  // Bump when the page copy changes; the sitemap reports it as lastmod.
  lastUpdated: '2026-09-29',
  author: { name: '7Ovr', url: 'https://7ovr.com' },
  xHandle: '@7ovrui',
  links: {
    repository,
    template: `${repository}/generate`,
    issues: `${repository}/issues`,
    github: 'https://github.com/7ovr',
    x: 'https://x.com/7ovrui',
    email: 'mailto:hello@7ovr.com',
    home: referral('https://7ovr.com'),
    appStarter: referral('https://starter.7ovr.com'),
    blocks: referral('https://7ovr.com/blocks'),
    templates: referral('https://7ovr.com/templates'),
    pro: referral('https://7ovr.com/blocks?tier=pro'),
    docs: referral('https://7ovr.com/docs'),
    changelog: referral('https://7ovr.com/changelog'),
    presets: 'https://ui.shadcn.com/create',
  },
} as const
