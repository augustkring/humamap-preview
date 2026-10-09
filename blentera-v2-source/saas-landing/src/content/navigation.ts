import { siteConfig } from '@/config/site'

// external marks a link that leaves the starter for the rest of 7Ovr, where a reader might not expect it.
export type NavLink = { label: string; href: string; external?: boolean }

// The one action the header offers, beside the menu on phones.
export const headerAction = { label: 'Get The Starter', href: siteConfig.links.repository }

export const headerNav: NavLink[] = [
  { label: 'Features', href: '/#features' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Coding Agents', href: '/#agents' },
  { label: 'Vite Starter', href: '/#vite-starter' },
  { label: 'Questions & Answers', href: '/#faq' },
]

// The menu adds Home, which the logo covers on wider screens.
export const mobileNav: NavLink[] = [{ label: 'Home', href: '/' }, ...headerNav]

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: 'Starter',
    links: [
      { label: 'Source', href: siteConfig.links.repository },
      { label: 'Use This Template', href: siteConfig.links.template },
      { label: 'Report An Issue', href: siteConfig.links.issues },
      { label: 'Documentation', href: siteConfig.links.docs, external: true },
      { label: 'Changelog', href: siteConfig.links.changelog, external: true },
    ],
  },
  {
    title: '7Ovr',
    links: [
      { label: 'Blocks', href: siteConfig.links.blocks },
      { label: 'Templates', href: siteConfig.links.templates },
      { label: 'Pro', href: siteConfig.links.pro },
      { label: 'Vite Starter', href: siteConfig.links.appStarter },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'X', href: siteConfig.links.x },
      { label: 'Email', href: siteConfig.links.email },
    ],
  },
]

export const footerNote = { credit: 'Built by', license: 'MIT licensed' }
