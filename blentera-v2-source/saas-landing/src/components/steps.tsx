import { ButtonLink } from '@/components/button-link'
import { Stage } from '@/components/mockup'
import { Section, SectionHeading } from '@/components/section'
import { StepVisual } from '@/components/step-visuals'
import { steps } from '@/content/steps'
import { withInlineCode } from '@/lib/inline-code'

export function Steps() {
  return (
    <Section id="how-it-works">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <SectionHeading
          sectionId="how-it-works"
          eyebrow={steps.eyebrow}
          title={steps.title}
          description={steps.description}
        >
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={steps.secondaryAction.href} variant="secondary" size="lg">
              {steps.secondaryAction.label}
            </ButtonLink>
            <ButtonLink href={steps.primaryAction.href} size="lg">
              {steps.primaryAction.label}
            </ButtonLink>
          </div>
        </SectionHeading>

        <ol className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {steps.items.map((step, index) => (
            <li key={step.title} className="flex reveal flex-col gap-6">
              <Stage variant={index + 1} className="h-48">
                <StepVisual name={step.visual} />
              </Stage>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-semibold">{step.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {withInlineCode(step.description)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
