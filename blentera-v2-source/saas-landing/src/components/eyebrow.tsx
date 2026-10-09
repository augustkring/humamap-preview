export type EyebrowProps = {
  icon: React.ComponentType<{ className?: string }>
  lead: string
  emphasis: string
}

// The line above a heading: a mark, a muted lead-in, then the words that carry the meaning.
export function Eyebrow({ icon: Icon, lead, emphasis }: EyebrowProps) {
  return (
    <p className="inline-flex items-center gap-2 text-sm">
      <span aria-hidden="true" className="flex text-foreground">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="text-muted-foreground">{lead} </span>
        <span className="font-medium text-foreground">{emphasis}</span>
      </span>
    </p>
  )
}
