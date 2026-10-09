import Link from 'next/link'

export type SiteLinkProps = Omit<React.ComponentProps<'a'>, 'href'> & { href: string }

// Every link picks its own element from the URL: another site opens in a new tab, a page here goes through Next's Link.
export function SiteLink({ href, children, ...props }: SiteLinkProps) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    )
  }

  // A mail link hands off to the mail app, so it needs neither Next's router nor a new tab.
  if (href.startsWith('mailto:')) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}
