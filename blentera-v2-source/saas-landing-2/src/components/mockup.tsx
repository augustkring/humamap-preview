import { cn } from '@/lib/utils'

// Mirrored by variant, so stages side by side never repeat the same lines.
const FLIPS = ['', '-scale-x-100', '-scale-y-100', 'rotate-180']

// Loose, hand-drawn lines that give a stage its texture, drawn a shade lighter than the stage itself.
function StagePattern({ variant }: { variant: number }) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        'pointer-events-none absolute inset-0 size-full text-background/60 dark:text-background/40',
        FLIPS[variant % FLIPS.length],
      )}
    >
      <path d="M-20 90C110 60 210 150 340 112s190-86 280-50" />
      <path d="M340 112c-12 96 22 190-40 308" />
      <path d="M-20 300c120-24 220 32 340 10s180-52 300-22" />
      <path d="M150 294c10-96-22-190 30-314" />
      <path d="M480 274c24 54 54 96 80 146" />
      <path d="M340 112l44 42M150 204l-42 30M480 64l-30-42M258 312l18 42" />
    </svg>
  )
}

// The tinted surface a mockup sits on, with two sheets peeking out behind it like a stack of cards.
export function Stage({
  variant = 0,
  className,
  children,
}: {
  variant?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      aria-hidden="true"
      data-nosnippet
      className={cn('relative isolate w-full pt-3', className)}
    >
      <span className="absolute inset-x-10 top-0 h-6 rounded-t-lg bg-foreground/10" />
      <span className="absolute inset-x-5 top-1.5 h-6 rounded-t-lg bg-foreground/15" />
      <div className="relative flex size-full items-center justify-center overflow-hidden rounded-lg bg-foreground/5 p-5">
        <StagePattern variant={variant} />
        {children}
      </div>
    </div>
  )
}

// The card surface starter.7ovr.com uses: a soft diagonal from muted to background.
export function MockCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-linear-to-br from-muted to-background text-foreground shadow-lg',
        className,
      )}
    >
      {children}
    </div>
  )
}

// The strip across the top of a mock window, file or run.
export function MockBar({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex items-center gap-2 border-b bg-muted/40 px-3 py-2', className)}>
      {children}
    </div>
  )
}

// The one filled button on a mock card, pressed on a loop.
export function MockButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-3 flex h-7 animate-press items-center justify-center rounded-md bg-primary text-xs font-medium text-primary-foreground motion-reduce:animate-none">
      {children}
    </span>
  )
}

const SWATCHES = ['bg-primary', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']

// The theme's colours as overlapping dots; the caller sets their size and overlap.
export function Swatches({ className }: { className: string }) {
  return (
    <span className={cn('flex', className)}>
      {SWATCHES.map((swatch) => (
        <span key={swatch} className={cn('rounded-full ring-2 ring-background', swatch)} />
      ))}
    </span>
  )
}
