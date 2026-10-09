import { ArrowUpIcon, CheckIcon, ChevronDownIcon, PlusIcon } from 'lucide-react'

import { MockCard } from '@/components/mockup'
import { cn } from '@/lib/utils'

// Each step of the agent's work ticks in on its cue, and the card fades before the loop starts over.
const WORK = [
  { label: 'Read CLAUDE.md', cue: 'animate-tick-1' },
  { label: 'Added src/content/changelog.ts', cue: 'animate-tick-2' },
  { label: 'Lint, types, tests and build passed', cue: 'animate-tick-3' },
]

export function AgentSession() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <MockCard className="p-3.5">
        <p className="text-sm leading-relaxed">
          Add a changelog page with the last three releases, and keep it on the same patterns as the
          rest of the site.
          <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-caret-blink bg-foreground motion-reduce:animate-none" />
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="grid size-6 place-items-center rounded-md border">
            <PlusIcon className="size-3.5" />
          </span>
          <span className="ml-auto flex items-center gap-1">
            Your Agent
            <ChevronDownIcon className="size-3" />
          </span>
          <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
            <ArrowUpIcon className="size-3.5" />
          </span>
        </div>
      </MockCard>
      <MockCard className="mx-4 flex flex-col gap-1.5 px-3.5 py-3 text-xs">
        {WORK.map((step) => (
          <span
            key={step.label}
            className={cn('flex items-center gap-2 motion-reduce:animate-none', step.cue)}
          >
            <CheckIcon className="size-3.5 shrink-0" />
            <span className="truncate">{step.label}</span>
          </span>
        ))}
      </MockCard>
    </div>
  )
}
