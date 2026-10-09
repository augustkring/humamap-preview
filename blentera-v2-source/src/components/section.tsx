import { Eyebrow, type EyebrowProps } from '@/components/eyebrow'
import { withInlineCode } from '@/lib/inline-code'
import { cn } from '@/lib/utils'

function titleIdFor(sectionId: string) {
  return `${sectionId}-title`
}

// Every section shares one padding and is labelled by its h2, whose id comes from the section's own.
export function Section({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={titleIdFor(id)}
      className={cn('px-4 py-20 sm:px-6 sm:py-24', className)}
    >
      {children}
    </section>
  )
}

export function SectionTitle({
  sectionId,
  className,
  children,
}: {
  sectionId: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <h2
      id={titleIdFor(sectionId)}
      className={cn(
        'font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function SectionDescription({ children }: { children: string }) {
  return <p className="text-pretty text-muted-foreground sm:text-lg">{withInlineCode(children)}</p>
}

export function SectionHeading({
  sectionId,
  eyebrow,
  title,
  description,
  align = 'center',
  children,
}: {
  sectionId: string
  eyebrow: EyebrowProps
  title: string
  description: string
  align?: 'center' | 'start'
  // Anything that belongs under the description, such as a row of links.
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex reveal flex-col gap-4',
        align === 'center' ? 'mx-auto max-w-2xl items-center text-center' : 'items-start',
      )}
    >
      <Eyebrow {...eyebrow} />
      <SectionTitle sectionId={sectionId}>{title}</SectionTitle>
      <SectionDescription>{description}</SectionDescription>
      {children}
    </div>
  )
}
