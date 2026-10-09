import { ButtonLink } from '@/components/button-link'
import { GitHubIcon } from '@/components/icons'
import { JsonLd } from '@/components/json-ld'
import { Section, SectionHeading } from '@/components/section'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { faq } from '@/content/faq'
import { withInlineCode } from '@/lib/inline-code'
import { faqPageSchema } from '@/lib/structured-data'

export function Faq() {
  return (
    <Section id="faq">
      {/* The FAQPage markup lives with the questions it describes, so dropping the section drops both. */}
      <JsonLd data={faqPageSchema(faq.items)} />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-5 lg:gap-16">
        <div className="flex flex-col gap-8 lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
          <SectionHeading
            align="start"
            sectionId="faq"
            eyebrow={faq.eyebrow}
            title={faq.title}
            description={faq.description}
          />
          <div className="flex reveal flex-col items-start gap-3 border-t pt-6">
            <p className="text-sm font-medium">{faq.contact.title}</p>
            <ButtonLink href={faq.contact.action.href} variant="outline">
              <GitHubIcon data-icon="inline-start" />
              {faq.contact.action.label}
            </ButtonLink>
          </div>
        </div>

        <div className="reveal lg:col-span-3">
          {/* hiddenUntilFound keeps closed answers in the HTML, for crawlers and find-in-page alike. */}
          <Accordion defaultValue={[faq.items[0].question]} hiddenUntilFound>
            {faq.items.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-pretty text-muted-foreground">{withInlineCode(item.answer)}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Section>
  )
}
