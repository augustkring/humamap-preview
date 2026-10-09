import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

const earlyAccess =
  "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access"

const tiers = [
  {
    name: "Free Core",
    price: "€0",
    suffix: "/company",
    description:
      "The planned entry point for companies starting to build a shared AI foundation.",
    features: [
      "Company foundation",
      "Core work and workflow layer",
      "Bring your own AI provider",
      "Basic history and controls",
    ],
    cta: "Join early access",
    featured: false,
    note: "Launch planning",
  },
  {
    name: "Premium",
    price: "€499",
    suffix: "/company/month",
    description:
      "The planned base tier for teams running recurring work and reusable company capability.",
    features: [
      "Expanded workflows and history",
      "Advanced memory",
      "Collaboration",
      "Expanded governance and controls",
    ],
    cta: "Talk to us",
    featured: true,
    note: "Planning base",
  },
  {
    name: "Enterprise",
    price: "€30K",
    suffix: "base ACV",
    description:
      "The planned enterprise path for stronger assurance, isolation and operating requirements.",
    features: [
      "Advanced governance and IAM",
      "Dedicated capacity options",
      "Enterprise support path",
      "API and integration requirements",
    ],
    cta: "Discuss enterprise",
    featured: false,
    note: "Planning base",
  },
]

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="flex w-full items-center justify-center px-6 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4 tracking-widest uppercase">
            Launch pricing
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Start with the foundation
          </h2>
          <p className="mt-4 text-muted-foreground">
            These prices reflect the current launch plan. They remain
            hypotheses until customer evidence validates the final commercial
            model.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={cn(
                "flex flex-col",
                tier.featured && "bg-muted/30 ring-2 ring-primary"
              )}
            >
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  {tier.name}
                </CardTitle>
                {tier.featured && (
                  <CardAction>
                    <Badge>{tier.note}</Badge>
                  </CardAction>
                )}
                <CardDescription className="text-sm sm:min-h-16">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div>
                  <p className="flex flex-wrap items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-foreground tabular-nums">
                      {tier.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {tier.suffix}
                    </span>
                  </p>
                  <p className="mt-1 h-5 text-xs text-muted-foreground">
                    {tier.note}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col gap-3 text-sm text-foreground">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check
                        className="size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  nativeButton={false}
                  variant={tier.featured ? "default" : "outline"}
                  size="lg"
                  className="w-full"
                  render={<a href={earlyAccess} />}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
