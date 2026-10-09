import { CheckIcon, ChevronDownIcon, MoonIcon, SunIcon } from 'lucide-react'

import { LogoMark } from '@/components/icons'
import { MockBar, MockButton, MockCard, Swatches } from '@/components/mockup'
import { siteConfig } from '@/config/site'
import type { FeatureVisual as FeatureVisualName } from '@/content/features'
import { cn } from '@/lib/utils'

// Two seconds apart, so up to five items share one animate-swap loop by taking turns.
const TURNS = [
  'delay-0',
  'delay-2000 opacity-0',
  'delay-4000 opacity-0',
  'delay-6000 opacity-0',
  'delay-8000 opacity-0',
]

function Swap({ items }: { items: string[] }) {
  return (
    <span className="grid">
      {items.map((item, index) => (
        <span
          key={item}
          className={cn(
            'col-start-1 row-start-1 animate-swap whitespace-nowrap motion-reduce:animate-none',
            TURNS[index],
          )}
        >
          {item}
        </span>
      ))}
    </span>
  )
}

function Dots() {
  return (
    <span className="flex gap-1">
      <span className="size-2 rounded-full bg-muted-foreground/30" />
      <span className="size-2 rounded-full bg-muted-foreground/30" />
      <span className="size-2 rounded-full bg-muted-foreground/30" />
    </span>
  )
}

// A Lighthouse-style score ring whose arc fills on each loop and rests full.
function Gauge() {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          strokeWidth="3"
          className="stroke-foreground/10"
        />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="100"
          className="animate-gauge stroke-foreground motion-reduce:animate-none"
        />
      </svg>
      <span className="text-xs font-semibold">100</span>
    </span>
  )
}

const ROUTES = ['/', '/robots.txt', '/sitemap.xml']

function Prerender() {
  return (
    <div className="relative w-full max-w-64">
      <MockCard>
        <MockBar className="justify-between text-xs">
          <span className="font-medium">next build</span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <CheckIcon className="size-3.5" />
            Compiled
          </span>
        </MockBar>
        <ul className="flex flex-col gap-1.5 px-3 pt-2.5 pb-6 text-xs">
          {ROUTES.map((route) => (
            <li key={route} className="flex items-center gap-2">
              <span className="size-1.5 rounded-full border border-foreground" />
              {route}
              <span className="ml-auto text-muted-foreground">Static</span>
            </li>
          ))}
        </ul>
      </MockCard>
      <MockCard className="absolute -right-3 -bottom-8 flex items-center gap-2 py-1.5 pr-3 pl-1.5">
        <Gauge />
        <span className="flex flex-col text-xs leading-tight">
          <span className="font-medium">Performance</span>
          <span className="text-muted-foreground">Lighthouse</span>
        </span>
      </MockCard>
    </div>
  )
}

function Metadata() {
  return (
    <div className="relative w-full max-w-64">
      <MockCard className="p-3 pb-5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-full border bg-background">
            <LogoMark className="size-3" />
          </span>
          <span className="flex min-w-0 flex-col text-xs leading-tight">
            <span className="truncate font-medium">{siteConfig.name}</span>
            <span className="truncate text-muted-foreground">your-domain.com</span>
          </span>
        </div>
        <span className="mt-2 block text-sm leading-snug font-semibold">{siteConfig.title}</span>
        <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {siteConfig.description}
        </span>
      </MockCard>
      <MockCard className="absolute -right-3 -bottom-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs">
        <CheckIcon className="size-3" />
        <Swap items={['title', 'description', 'canonical', 'og:image', 'JSON-LD']} />
      </MockCard>
    </div>
  )
}

const CHECKS = [
  { name: 'lint', wave: 'delay-0' },
  { name: 'types', wave: 'delay-350' },
  { name: 'test', wave: 'delay-700' },
  { name: 'build', wave: 'delay-1050' },
  { name: 'e2e', wave: 'delay-1400' },
  { name: 'lighthouse', wave: 'delay-1750' },
]

function Quality() {
  return (
    <MockCard className="w-full max-w-64 p-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground/10">
          <CheckIcon className="size-4" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">All checks have passed</span>
          <span className="text-xs text-muted-foreground">6 successful checks</span>
        </span>
      </div>
      <ul className="mt-3 grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
        {CHECKS.map((check) => (
          <li key={check.name} className="flex items-center gap-1">
            {/* The wave moves a wrapper, since an animated svg itself is not composited on the GPU. */}
            <span
              className={cn('flex shrink-0 animate-wave motion-reduce:animate-none', check.wave)}
            >
              <CheckIcon className="size-3" />
            </span>
            {check.name}
          </li>
        ))}
      </ul>
      <MockButton>Merge Pull Request</MockButton>
    </MockCard>
  )
}

function NoJavaScript() {
  return (
    <MockCard className="w-full max-w-64">
      <MockBar className="text-xs text-muted-foreground">
        <Dots />
        <span className="truncate">your-domain.com</span>
        {/* Resting off; the loop switches it on for a moment, and the page below never changes. */}
        <span className="ml-auto flex items-center gap-1.5">
          JS
          <span className="relative h-4 w-7 rounded-full bg-muted ring-1 ring-border">
            <span className="absolute inset-0 animate-switch-track rounded-full bg-primary opacity-0 motion-reduce:animate-none" />
            <span className="absolute top-0.5 left-0.5 size-3 animate-switch-knob rounded-full bg-background shadow-sm motion-reduce:animate-none" />
          </span>
        </span>
      </MockBar>
      <div className="flex flex-col gap-2 p-3 text-xs">
        <span className="text-sm font-semibold">Questions & Answers</span>
        <span className="flex flex-col gap-1 rounded-md border p-2">
          <span className="flex items-center justify-between gap-2 font-medium">
            Does it work without JavaScript?
            <ChevronDownIcon className="size-3 shrink-0 text-muted-foreground" />
          </span>
          <span className="text-muted-foreground">Yes, every answer is in the HTML.</span>
        </span>
      </div>
    </MockCard>
  )
}

function Content() {
  return (
    <MockCard className="w-full max-w-64 font-mono text-xs">
      <MockBar>
        hero.ts
        <span className="text-muted-foreground">src/content</span>
      </MockBar>
      <div className="flex flex-col gap-1 p-3 leading-relaxed">
        <span className="flex gap-3">
          <span className="text-muted-foreground">1</span>
          <span>
            <span className="text-muted-foreground">export const</span> hero = {'{'}
          </span>
        </span>
        <span className="flex gap-3">
          <span className="text-muted-foreground">2</span>
          <span className="flex items-center pl-3">
            <span className="text-muted-foreground">title:&nbsp;</span>
            <Swap
              items={[
                "'Your headline'",
                "'Your product'",
                "'Your launch'",
                "'Your story'",
                "'Your words'",
              ]}
            />
            <span className="ml-0.5 h-3.5 w-1.5 animate-caret-blink bg-foreground/80 motion-reduce:animate-none" />
          </span>
        </span>
        <span className="flex gap-3">
          <span className="text-muted-foreground">3</span>
          <span className="pl-3 text-muted-foreground">description: …</span>
        </span>
        <span className="flex gap-3">
          <span className="text-muted-foreground">4</span>
          <span>{'}'}</span>
        </span>
      </div>
    </MockCard>
  )
}

// One small page, drawn in either the current theme or its inverse.
function MiniPage({ inverted = false }: { inverted?: boolean }) {
  return (
    <div
      className={cn(
        'flex w-60 flex-col gap-1.5 p-3.5',
        inverted ? 'bg-foreground text-background' : 'bg-background text-foreground',
      )}
    >
      <div className="flex items-center justify-between">
        <LogoMark className="size-3.5" />
        {inverted ? (
          <>
            <MoonIcon className="size-3.5 dark:hidden" />
            <SunIcon className="hidden size-3.5 dark:block" />
          </>
        ) : (
          <>
            <SunIcon className="size-3.5 dark:hidden" />
            <MoonIcon className="hidden size-3.5 dark:block" />
          </>
        )}
      </div>
      <span className="mt-1 text-sm font-semibold">Your Landing Page</span>
      <span className={cn('text-xs', inverted ? 'text-background/70' : 'text-muted-foreground')}>
        One preset, every section.
      </span>
      <span
        className={cn(
          'mt-1.5 w-fit rounded-md px-2 py-1 text-xs font-medium',
          inverted ? 'bg-background text-foreground' : 'bg-foreground text-background',
        )}
      >
        Get Started
      </span>
    </div>
  )
}

function Presets() {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-lg border shadow-lg">
        <MiniPage />
        <div className="absolute inset-0 theme-split">
          <MiniPage inverted />
        </div>
        <div className="absolute inset-0 theme-split-line">
          <span className="absolute inset-y-0 left-0 w-px bg-border" />
        </div>
      </div>
      <MockCard className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full px-2.5 py-1 text-xs">
        <Swatches className="-space-x-1 *:size-3" />
        <span className="font-mono">apply b4Wm</span>
      </MockCard>
    </div>
  )
}

const VISUALS = {
  prerender: Prerender,
  metadata: Metadata,
  quality: Quality,
  'no-javascript': NoJavaScript,
  content: Content,
  presets: Presets,
} satisfies Record<FeatureVisualName, () => React.ReactNode>

export function FeatureVisual({ name }: { name: FeatureVisualName }) {
  const Visual = VISUALS[name]
  return <Visual />
}
