"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight } from "lucide-react"

const faqs = [
  {
    q: "What is BLENTERA?",
    a: "BLENTERA is a company AI foundation: a shared layer for company context, work, organisation, governance, learning and portable execution across people and AI.",
  },
  {
    q: "Is BLENTERA an AI agent platform?",
    a: "Agents are one execution option. The product is positioned underneath them: the company layer that keeps context, work, authority and learning useful while agents, models and runtimes change.",
  },
  {
    q: "Does BLENTERA replace our existing AI tools?",
    a: "The design goal is the opposite of forcing a single provider. Models, agents and runtimes should remain replaceable while the company foundation persists.",
  },
  {
    q: "How does company memory work?",
    a: "Useful outcomes are not automatically treated as truth. Learning can be reviewed, corrected and promoted into shared company memory before it is reused in later work.",
  },
  {
    q: "Can we use our own models or runtime?",
    a: "Provider portability is a core product principle. The current direction includes customer-owned model/provider access and customer-managed runtime options.",
  },
  {
    q: "Is BLENTERA production-ready today?",
    a: "The technical foundation exists, but the current master product status remains production NO-GO until qualification, live operating evidence and customer gates are complete. The public website therefore uses an early-access CTA.",
  },
  {
    q: "Does BLENTERA guarantee EU AI Act compliance?",
    a: "No. BLENTERA is designed to provide controls and evidence that can support responsible operation. Exact legal obligations depend on the organisation, role and use case.",
  },
]

export default function Faqs() {
  return (
    <section className="flex w-full items-center justify-center px-6 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <Badge variant="outline" className="tracking-widest uppercase">
                FAQ
              </Badge>
              <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
                What BLENTERA is, and what it is not
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The category comes first: BLENTERA is the company AI foundation,
                not another model, agent wrapper or generic automation tool.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-border bg-background">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    Evaluating BLENTERA?
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Ask about the product, architecture or early access.
                  </span>
                </div>
              </div>
              <Button
                nativeButton={false}
                render={
                  <a href="mailto:ak@augustkring.com?subject=BLENTERA%20question" />
                }
                className="w-full justify-between"
              >
                Contact BLENTERA
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>

          <Accordion defaultValue={[faqs[0].q]}>
            {faqs.map(({ q, a }) => (
              <AccordionItem key={q} value={q}>
                <AccordionTrigger className="py-3.5 text-sm font-medium">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="pb-3.5 text-sm text-muted-foreground">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
