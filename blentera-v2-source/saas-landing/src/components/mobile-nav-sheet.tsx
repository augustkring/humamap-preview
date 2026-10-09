'use client'

import Link from 'next/link'

import { HomeLink } from '@/components/home-link'
import { Logo } from '@/components/logo'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { NavLink } from '@/content/navigation'

const LINK_CLASS =
  'rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none'

export function MobileNavSheet({
  open,
  onOpenChange,
  links,
  trigger,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  links: NavLink[]
  trigger: React.RefObject<HTMLButtonElement | null>
  children: React.ReactNode
}) {
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* The trigger lives outside the sheet, so closing hands focus back to it by name. */}
      <SheetContent side="right" finalFocus={trigger}>
        <SheetHeader>
          {/* The logo shows instead, while the title still names the dialog. */}
          <span className="sr-only">
            <SheetTitle>Menu</SheetTitle>
          </span>
          <Logo />
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
          {links.map((link) =>
            // Home goes through HomeLink, which scrolls to the top on the page already open.
            link.href === '/' ? (
              <HomeLink key={link.href} onClick={close} className={LINK_CLASS}>
                {link.label}
              </HomeLink>
            ) : (
              <Link key={link.href} href={link.href} onClick={close} className={LINK_CLASS}>
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="mt-auto grid p-4">{children}</div>
      </SheetContent>
    </Sheet>
  )
}
