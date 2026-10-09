import { FeatureVisual } from '@/components/feature-visuals'
import { IconPoint } from '@/components/icon-point'
import { Stage } from '@/components/mockup'
import { Section, SectionHeading } from '@/components/section'
import { features } from '@/content/features'
import { withInlineCode } from '@/lib/inline-code'

export function Features() {
  return (
    <Section id="features">
      <div className="mx-auto flex max-w-6xl flex-col gap-14">
        <SectionHeading
          sectionId="features"
          eyebrow={features.eyebrow}
          title={features.title}
          description={features.description}
        />

        <ul className="grid reveal grid-cols-1 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {features.items.map((item, index) => (
            <li key={item.title} className="flex flex-col gap-6 bg-background p-6 sm:p-8">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-heading font-semibold">{item.title}</h3>
                <p className="text-sm text-pretty text-muted-foreground">
                  {withInlineCode(item.description)}
                </p>
              </div>
              <Stage variant={index} className="mt-auto h-64">
                <FeatureVisual name={item.visual} />
              </Stage>
            </li>
          ))}
        </ul>

        <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.extras.map((item) => (
            <IconPoint key={item.title} {...item} />
          ))}
        </ul>
      </div>
    </Section>
  )
}
