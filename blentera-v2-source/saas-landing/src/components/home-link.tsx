'use client'

import Link from 'next/link'

type HomeLinkProps = Omit<React.ComponentProps<typeof Link>, 'href' | 'onClick'> & {
  onClick?: () => void
}

// Next keeps the scroll position when a link points at the page already open, so on the home page this scrolls up itself.
export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  return (
    <Link
      href="/"
      onClick={(event) => {
        onClick?.()
        const newTab = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
        if (window.location.pathname !== '/' || newTab) return
        event.preventDefault()
        window.history.replaceState(null, '', '/')
        window.scrollTo({ top: 0 })
      }}
      {...props}
    />
  )
}
