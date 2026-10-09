// Inline code. The text colour is set, because muted text on the muted chip falls short of AA contrast.
export function Mono({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-foreground">{children}</code>
  )
}
