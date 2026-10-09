import Link from 'next/link'

import { ButtonLink } from '@/components/button-link'
import { GitHubIcon } from '@/components/icons'
import { LogoLink } from '@/components/logo'
import { MobileNav } from '@/components/mobile-nav'
import { headerAction, headerNav, mobileNav } from '@/content/navigation'

function HeaderAction({ size }: { size?: 'lg' }) {
  return (
    <ButtonLink href={headerAction.href} size={size}>
      <GitHubIcon data-icon="inline-start" />
      {headerAction.label}
    </ButtonLink>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-2 sm:px-4">
      <div className="relative mx-auto flex h-16 w-full max-w-6xl header-glass items-center justify-between gap-4 rounded-2xl border px-4 sm:px-6">
        <LogoLink />

        {/* w-max, because left-1/2 alone caps an absolute box at half the header and wraps the links. */}
        <nav
          aria-label="Main"
          className="absolute left-1/2 hidden w-max -translate-x-1/2 items-center gap-1 lg:flex"
        >
          {headerNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-2 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none xl:px-3"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <span className="max-sm:hidden">
            <HeaderAction />
          </span>
          <span className="lg:hidden">
            <MobileNav links={mobileNav}>
              <HeaderAction size="lg" />
            </MobileNav>
          </span>
        </div>
      </div>
    </header>
  )
}
