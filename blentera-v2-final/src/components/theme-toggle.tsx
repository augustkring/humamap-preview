'use client'

import { MoonIcon, SunIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useToggleTheme } from '@/hooks/use-toggle-theme'

export function FooterThemeToggle() {
  const toggleTheme = useToggleTheme()

  return (
    <Button variant="outline" aria-keyshortcuts="d" onClick={toggleTheme}>
      {/* Both icons render and the dark variant picks one, so the server HTML and the first client render match. */}
      <SunIcon data-icon="inline-start" aria-hidden="true" className="hidden dark:block" />
      <MoonIcon data-icon="inline-start" aria-hidden="true" className="dark:hidden" />
      Toggle Theme
      {/* aria-keyshortcuts already announces the key, so the hint stays out of the button's name. */}
      <Kbd aria-hidden="true">D</Kbd>
    </Button>
  )
}
