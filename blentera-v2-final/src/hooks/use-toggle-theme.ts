import { useTheme } from 'next-themes'

// Flips to the other theme from the one on screen, so a system theme flips too.
export function useToggleTheme() {
  const { resolvedTheme, setTheme } = useTheme()
  return () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
}
