import { ButtonLink } from '@/components/button-link'
import { Eyebrow } from '@/components/eyebrow'
import { GitHubIcon } from '@/components/icons'
import { MockCard } from '@/components/mockup'
import { Section, SectionDescription, SectionTitle } from '@/components/section'
import { cta } from '@/content/cta'
import { cn } from '@/lib/utils'

// One position and float offset per card, in the order of cta.cards.
const PLACEMENTS = [
  'top-12 left-4 -rotate-2',
  'top-16 right-4 rotate-2',
  'bottom-12 left-16 rotate-1',
  'bottom-16 right-14 -rotate-1',
]
const FLOATS = ['delay-0', 'delay-700', 'delay-300', 'delay-1000']

export function Cta() {
  return (
    <Section id="get-started" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 mx-auto h-96 max-w-3xl -translate-y-1/2 bg-glow"
      />
      <div
        aria-hidden="true"
        data-nosnippet
        className="pointer-events-none absolute inset-0 mx-auto hidden max-w-6xl lg:block"
      >
        {cta.cards.map((card, index) => (
          <div key={card.title} className={cn('absolute', PLACEMENTS[index])}>
            <MockCard
              className={cn(
                'flex w-60 animate-float items-center gap-3 p-3 motion-reduce:animate-none',
                FLOATS[index],
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-md border bg-background">
                <card.icon className="size-4" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono text-xs font-semibold">{card.title}</span>
                <span className="truncate text-xs text-foreground">{card.detail}</span>
              </span>
            </MockCard>
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-xl reveal flex-col items-center gap-5 text-center">
        <Eyebrow icon={GitHubIcon} {...cta.eyebrow} />
        <SectionTitle sectionId="get-started" className="sm:text-5xl">
          {cta.title}
        </SectionTitle>
        <SectionDescription>{cta.description}</SectionDescription>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={cta.secondaryAction.href} variant="secondary" size="lg">
            {cta.secondaryAction.label}
          </ButtonLink>
          <ButtonLink href={cta.primaryAction.href} size="lg">
            <GitHubIcon data-icon="inline-start" />
            {cta.primaryAction.label}
          </ButtonLink>
        </div>
      </div>
    </Section>
  )
}
