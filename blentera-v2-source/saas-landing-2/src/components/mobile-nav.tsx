'use client'

import { MenuIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { MobileNavSheet } from '@/components/mobile-nav-sheet'
import { Button } from '@/components/ui/button'
import type { NavLink } from '@/content/navigation'

// The sheet and its dialog code load on first use, so only visitors who open the menu download them.
function loadSheet() {
  return import('@/components/mobile-nav-sheet').then((module) => module.MobileNavSheet)
}

export function MobileNav({ links, children }: { links: NavLink[]; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  // Kept in state, not behind Suspense, which holds a freshly loaded sheet back for a moment.
  const [Sheet, setSheet] = useState<typeof MobileNavSheet | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  function load() {
    void loadSheet().then((component) => setSheet(() => component))
  }

  // Phones and tablets get around through the menu, so they fetch it at the first scroll or touch; wider screens never do.
  useEffect(() => {
    if (!window.matchMedia('(width < 64rem)').matches) return
    const preload = () => {
      void loadSheet().then((component) => setSheet(() => component))
    }
    const once = { once: true, passive: true }
    window.addEventListener('scroll', preload, once)
    window.addEventListener('pointerdown', preload, once)
    return () => {
      window.removeEventListener('scroll', preload)
      window.removeEventListener('pointerdown', preload)
    }
  }, [])

  return (
    <>
      <Button
        ref={trigger}
        variant="ghost"
        size="icon"
        aria-label="Open Menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        // A pointer on the way or keyboard focus starts the download before the click lands.
        onPointerEnter={load}
        onFocus={load}
        onClick={() => {
          load()
          setOpen(true)
        }}
      >
        <MenuIcon aria-hidden="true" />
      </Button>
      {Sheet && (
        <Sheet open={open} onOpenChange={setOpen} links={links} trigger={trigger}>
          {children}
        </Sheet>
      )}
    </>
  )
}
