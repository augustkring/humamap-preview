import type { LucideIcon } from 'lucide-react'

import { withInlineCode } from '@/lib/inline-code'

export type IconPointProps = { icon: LucideIcon; title: string; description: string }

// A list item led by a small icon tile, as under the features and beside the coding agents.
export function IconPoint({ icon: Icon, title, description }: IconPointProps) {
  return (
    <li className="flex reveal items-start gap-3">
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-md border bg-linear-to-br from-muted to-background shadow-sm"
      >
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col gap-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-sm text-pretty text-muted-foreground">{withInlineCode(description)}</p>
      </div>
    </li>
  )
}
