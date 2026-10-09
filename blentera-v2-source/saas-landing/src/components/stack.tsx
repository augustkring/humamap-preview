import {
  BaseUiIcon,
  type BrandMark,
  LefthookIcon,
  LighthouseIcon,
  LucideLogoIcon,
  NextjsIcon,
  NodejsIcon,
  OxcIcon,
  PlaywrightIcon,
  PnpmIcon,
  ReactIcon,
  ShadcnIcon,
  TailwindIcon,
  TypeScriptIcon,
  VercelIcon,
  VitestIcon,
} from '@/components/icons'
import { stack } from '@/content/hero'
import { cn } from '@/lib/utils'

const MARKS: Record<(typeof stack.items)[number], BrandMark> = {
  'Next.js': NextjsIcon,
  React: ReactIcon,
  TypeScript: TypeScriptIcon,
  'Tailwind CSS': TailwindIcon,
  'shadcn/ui': ShadcnIcon,
  'Base UI': BaseUiIcon,
  Vercel: VercelIcon,
  Vitest: VitestIcon,
  Playwright: PlaywrightIcon,
  Lighthouse: LighthouseIcon,
  pnpm: PnpmIcon,
  'Node.js': NodejsIcon,
  Oxc: OxcIcon,
  Lefthook: LefthookIcon,
  Lucide: LucideLogoIcon,
}

// The marquee scrolls two identical lists; the copy is hidden from screen readers and from reduced motion.
function StackList({ copy = false }: { copy?: boolean }) {
  return (
    <ul
      aria-hidden={copy ? true : undefined}
      className={cn(
        'flex shrink-0 animate-marquee items-center gap-12 pr-12 group-hover:paused motion-reduce:shrink motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-6 motion-reduce:pr-0',
        copy && 'motion-reduce:hidden',
      )}
    >
      {stack.items.map((name) => {
        const Mark = MARKS[name]
        return (
          <li key={name} className="flex items-center gap-2.5 text-muted-foreground">
            <Mark className="size-6 shrink-0" />
            <span className="text-base font-semibold whitespace-nowrap">{name}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function Stack() {
  return (
    <section aria-label="Built With" className="pt-4 pb-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8">
        <p className="px-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {stack.caption}
        </p>
        <div className="group flex w-full overflow-hidden mask-x-from-85% motion-reduce:mask-none">
          <StackList />
          <StackList copy />
        </div>
      </div>
    </section>
  )
}
