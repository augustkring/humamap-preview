import { CheckIcon, PencilIcon } from 'lucide-react'

import { GitHubIcon, VercelIcon } from '@/components/icons'
import { MockBar, MockButton, MockCard, Swatches } from '@/components/mockup'
import { siteConfig } from '@/config/site'
import type { StepVisual as StepVisualName } from '@/content/steps'

function Clone() {
  const repository = siteConfig.links.repository.split('/').slice(-2).join('/')

  return (
    <MockCard className="w-full max-w-56 p-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background">
          <GitHubIcon className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col text-xs leading-tight">
          <span className="truncate font-semibold">{repository}</span>
          <span className="text-muted-foreground">Public Template</span>
        </span>
      </div>
      <MockButton>Use This Template</MockButton>
    </MockCard>
  )
}

const FILES = [
  { folder: 'config/', name: 'site.ts' },
  { folder: 'content/', name: 'hero.ts' },
  { folder: 'content/', name: 'features.ts' },
  { folder: 'content/', name: 'faq.ts' },
]

function Content() {
  return (
    <MockCard className="w-full max-w-56 p-1.5 font-mono text-xs">
      <ul>
        {FILES.map((file) => (
          <li key={file.name} className="flex h-6 items-center px-2">
            <span className="text-muted-foreground">src/{file.folder}</span>
            {file.name}
          </li>
        ))}
      </ul>
      {/* One highlight for all four 1.5rem rows, so animate-hop-rows can walk it down the list. */}
      <span className="absolute inset-x-1.5 top-1.5 flex h-6 animate-hop-rows items-center justify-end rounded-md bg-foreground/5 pr-2 ring-1 ring-foreground/15 motion-reduce:animate-none">
        <PencilIcon className="size-3" />
      </span>
    </MockCard>
  )
}

function Preset() {
  return (
    <MockCard className="w-full max-w-56 p-3 text-xs">
      <span className="flex items-center gap-2 font-mono">
        <span className="text-muted-foreground">$</span>
        shadcn apply b4Wm
      </span>
      <span className="mt-2 flex items-center gap-1.5 text-muted-foreground">
        <CheckIcon className="size-3.5" />
        Theme tokens updated
      </span>
      <Swatches className="mt-3 -space-x-1.5 *:size-6" />
    </MockCard>
  )
}

function Deploy() {
  return (
    <MockCard className="w-full max-w-56 text-xs">
      <MockBar>
        <VercelIcon className="size-3" />
        <span className="font-medium">Production</span>
        <span className="ml-auto flex items-center gap-1.5 text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-beacon rounded-full bg-foreground opacity-0 motion-reduce:animate-none" />
            <span className="size-1.5 rounded-full bg-foreground" />
          </span>
          Ready
        </span>
      </MockBar>
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        <span className="flex items-center justify-between gap-2">
          your-domain.com
          <span className="flex items-center gap-1 text-muted-foreground">
            <CheckIcon className="size-3" />
            Indexable
          </span>
        </span>
        <span className="flex items-center justify-between gap-2 text-muted-foreground">
          preview.vercel.app
          <span>noindex</span>
        </span>
      </div>
    </MockCard>
  )
}

const VISUALS = {
  clone: Clone,
  content: Content,
  preset: Preset,
  deploy: Deploy,
} satisfies Record<StepVisualName, () => React.ReactNode>

export function StepVisual({ name }: { name: StepVisualName }) {
  const Visual = VISUALS[name]
  return <Visual />
}
