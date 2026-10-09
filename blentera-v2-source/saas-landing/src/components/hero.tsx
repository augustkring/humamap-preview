import { ZapIcon } from 'lucide-react'

import { CopyCommand } from '@/components/copy-command'
import { Eyebrow } from '@/components/eyebrow'
import { HeroLogos } from '@/components/hero-logos'
import { hero } from '@/content/hero'
import { withInlineCode } from '@/lib/inline-code'
import { cn } from '@/lib/utils'

// The eyebrow bolt, filled like the one on starter.7ovr.com.
function FilledZap({ className }: { className?: string }) {
  return <ZapIcon className={cn(className, 'fill-current')} />
}

export function Hero() {
  const [before, after] = hero.title.split(hero.titleEmphasis)
  // On a large screen the last word before the emphasis moves down with it; narrower screens balance their own lines.
  const cut = before.trimEnd().lastIndexOf(' ')
  // Its first two words stay together, so a narrow screen never ends a line on a lone chip.
  const emphasis = hero.titleEmphasis.replace(' ', ' ')

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate px-4 pt-20 pb-12 sm:px-6 sm:pt-28 sm:pb-16"
    >
      {/* Taller than the hero on purpose: it fades out behind the stack strip instead of stopping at a hard edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-176 max-w-5xl bg-glow"
      />
      <HeroLogos />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <div className="animate-rise-fade motion-reduce:animate-none">
          <Eyebrow icon={FilledZap} {...hero.eyebrow} />
        </div>
        {/* No fade on the headline: it is the largest paint, and a transparent element is skipped for it. */}
        <h1
          id="hero-title"
          className="animate-rise font-heading text-4xl font-bold tracking-tighter text-balance delay-75 motion-reduce:animate-none sm:text-5xl"
        >
          {before.slice(0, cut)}
          <br className="max-lg:hidden" />
          {before.slice(cut)}
          {/* A chip like the inline code on the page, in a lighter weight than the headline. */}
          <em className="rounded-xl bg-foreground/10 box-decoration-clone px-3 font-light not-italic">
            {emphasis}
          </em>
          {after}
        </h1>
        <p className="max-w-2xl animate-rise-fade text-lg text-pretty text-muted-foreground delay-150 motion-reduce:animate-none">
          {withInlineCode(hero.description)}
        </p>
        <div className="mt-2 max-w-full animate-rise-fade delay-200 motion-reduce:animate-none">
          <CopyCommand command={hero.command} highlight={hero.commandHighlight} />
        </div>
      </div>
    </section>
  )
}
