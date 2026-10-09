import { Syne } from 'next/font/google'

import { HomeLink } from '@/components/home-link'
import { LogoMark } from '@/components/icons'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

// Syne is loaded here for the wordmark alone, so a preset's font change leaves the brand as it is.
const wordmark = Syne({ subsets: ['latin'], weight: '700' })

export function Logo() {
  return (
    // The spaces keep the words apart in the text a link's name is checked against; flex ignores them.
    <span className="flex items-center gap-2 text-foreground">
      <LogoMark className="size-6 shrink-0" />{' '}
      <span className={cn(wordmark.className, 'text-2xl leading-none tracking-tight')}>7Ovr</span>{' '}
      <span aria-hidden="true" className="text-sm text-muted-foreground">
        /
      </span>{' '}
      <span className="text-sm font-medium text-muted-foreground">Landing</span>
    </span>
  )
}

// The logo as the way home, in the header and the footer alike.
export function LogoLink() {
  return (
    <HomeLink
      aria-label={siteConfig.name}
      className="rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <Logo />
    </HomeLink>
  )
}

// The mark and wordmark as one SVG, so they scale with their container instead of a font size.
// The mark stands as tall as the capitals and sits on their baseline.
export function Wordmark() {
  return (
    <svg viewBox="0 0 476 120" aria-hidden="true" className="w-full fill-current">
      <LogoMark x={-1} y={26} width={89} height={89} />
      <text x="113" y="104" fontSize="136" className={wordmark.className}>
        7Ovr
      </text>
    </svg>
  )
}
