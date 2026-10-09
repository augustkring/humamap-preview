import { ArrowUpRightIcon, MailIcon } from 'lucide-react'

import { ButtonLink } from '@/components/button-link'
import { GitHubIcon, LogoMark, XIcon } from '@/components/icons'
import { LogoLink, Wordmark } from '@/components/logo'
import { SiteLink } from '@/components/site-link'
import { FooterThemeToggle } from '@/components/theme-toggle'
import { siteConfig } from '@/config/site'
import { footerColumns, footerNote } from '@/content/navigation'

export function SiteFooter() {
  return (
    <footer className="overflow-hidden border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pt-16 pb-12 sm:px-6 lg:grid-cols-12">
        <div className="flex flex-col items-start gap-6 lg:col-span-5">
          <LogoLink />
          <p className="max-w-sm text-sm text-pretty text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex items-center gap-2">
            <ButtonLink
              href={siteConfig.links.repository}
              aria-label="Source On GitHub"
              variant="outline"
              size="icon"
            >
              <GitHubIcon />
            </ButtonLink>
            <ButtonLink
              href={siteConfig.links.x}
              aria-label="7Ovr On X"
              variant="outline"
              size="icon"
            >
              <XIcon />
            </ButtonLink>
            <ButtonLink
              href={siteConfig.links.email}
              aria-label="Email 7Ovr"
              variant="outline"
              size="icon"
            >
              <MailIcon />
            </ButtonLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          {footerColumns.map((column) => {
            const titleId = `footer-${column.title.toLowerCase().replaceAll(' ', '-')}`
            return (
              <nav key={column.title} aria-labelledby={titleId} className="flex flex-col gap-4">
                <h2 id={titleId} className="text-sm font-semibold">
                  {column.title}
                </h2>
                <ul className="flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <SiteLink
                        href={link.href}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        {link.label}
                        {link.external && (
                          <ArrowUpRightIcon aria-hidden="true" className="size-3.5" />
                        )}
                      </SiteLink>
                    </li>
                  ))}
                </ul>
              </nav>
            )
          })}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col-reverse items-start justify-between gap-4 border-t py-6 sm:flex-row sm:items-center">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {footerNote.credit}
            <SiteLink
              href={siteConfig.links.home}
              className="flex items-center gap-1.5 rounded-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <LogoMark className="size-4" />
              {siteConfig.author.name}
            </SiteLink>
            <span aria-hidden="true">·</span>
            {footerNote.license}
          </p>
          <FooterThemeToggle />
        </div>
      </div>

      <div
        aria-hidden="true"
        data-nosnippet
        className="pointer-events-none mx-auto -mb-8 w-full max-w-6xl mask-b-from-30% px-4 text-foreground/10 select-none sm:-mb-16 sm:px-6"
      >
        <Wordmark />
      </div>
    </footer>
  )
}
