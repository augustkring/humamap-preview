import {
  BaseUiIcon,
  type BrandMark,
  NextjsLogo,
  ReactLogo,
  ShadcnIcon,
  TailwindLogo,
  TypeScriptLogo,
  VercelIcon,
  VitestLogo,
} from '@/components/icons'
import { MockCard } from '@/components/mockup'
import { cn } from '@/lib/utils'

// Written out in full, because Tailwind only generates classes it can read. They stay beside the copy and above the stack strip.
const TILES: { Logo: BrandMark; place: string; size: string; float: string }[] = [
  {
    Logo: TypeScriptLogo,
    place: 'top-0 left-44 rotate-8 delay-300',
    size: 'size-12',
    float: 'delay-700',
  },
  {
    Logo: ReactLogo,
    place: 'top-24 left-8 -rotate-8 delay-500',
    size: 'size-16',
    float: 'delay-0',
  },
  {
    Logo: TailwindLogo,
    place: 'top-52 left-36 rotate-6 delay-700',
    size: 'size-14',
    float: 'delay-500',
  },
  {
    Logo: NextjsLogo,
    place: 'top-76 left-4 -rotate-6 delay-1000',
    size: 'size-12',
    float: 'delay-1000',
  },
  {
    Logo: ShadcnIcon,
    place: 'top-0 right-44 -rotate-6 delay-300',
    size: 'size-12',
    float: 'delay-300',
  },
  {
    Logo: BaseUiIcon,
    place: 'top-24 right-8 rotate-8 delay-500',
    size: 'size-16',
    float: 'delay-1000',
  },
  {
    Logo: VitestLogo,
    place: 'top-52 right-36 -rotate-8 delay-700',
    size: 'size-14',
    float: 'delay-0',
  },
  {
    Logo: VercelIcon,
    place: 'top-76 right-4 rotate-6 delay-1000',
    size: 'size-12',
    float: 'delay-700',
  },
]

export function HeroLogos() {
  return (
    <div
      aria-hidden="true"
      data-nosnippet
      className="pointer-events-none absolute inset-x-0 top-14 mx-auto hidden h-96 max-w-7xl xl:block"
    >
      {TILES.map(({ Logo, place, size, float }) => (
        <div
          key={place}
          className={cn('absolute animate-rise-fade motion-reduce:animate-none', place)}
        >
          <MockCard
            className={cn(
              'grid animate-float place-items-center rounded-xl motion-reduce:animate-none',
              size,
              float,
            )}
          >
            <Logo className="size-1/2" />
          </MockCard>
        </div>
      ))}
    </div>
  )
}
