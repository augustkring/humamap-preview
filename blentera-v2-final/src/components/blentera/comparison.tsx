import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, X, ArrowRight } from "lucide-react"

const earlyAccess =
  "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access"

const blenteraPoints = [
  "Shared company context carries across people and AI",
  "Reviewed memory stays with the company",
  "Goals, tasks and workflows remain reusable",
  "Roles and authority stay explicit",
  "Models, agents and runtimes remain replaceable",
  "Stable steps can move from AI into software",
  "Approvals and evidence sit outside the model",
  "New capability starts from the existing foundation",
]

const fragmentedPoints = [
  "Each new tool reconnects company context",
  "Useful learning stays trapped in local chats or people",
  "Workflows are rebuilt for each new use case",
  "Authority is buried inside prompts and tool settings",
  "Provider changes force another round of setup",
  "Repeated AI work keeps paying the reasoning cost",
  "Evidence and approvals are added as afterthoughts",
  "Every new capability risks starting from zero",
]

function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md bg-primary">
        <Check className="size-3 text-primary-foreground" aria-hidden />
      </span>
      <span className="text-sm text-foreground">{text}</span>
    </li>
  )
}

function CrossRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-md bg-muted">
        <X className="size-3 text-muted-foreground" aria-hidden />
      </span>
      <span className="text-sm text-muted-foreground">{text}</span>
    </li>
  )
}

export default function Comparison() {
  return (
    <section
      id="control"
      className="flex w-full items-center justify-center px-6 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-10 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            Continuity by design
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Stop starting from zero
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">
            Keep the company layer while people, agents, models and tools change
            around it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-primary/30 ring-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  With BLENTERA
                </CardTitle>
                <Badge variant="default">Shared foundation</Badge>
              </div>
              <CardDescription className="sm:min-h-10">
                Company capability stays persistent, reviewable and portable.
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
              <ul className="flex flex-col gap-3">
                {blenteraPoints.map((point) => (
                  <CheckRow key={point} text={point} />
                ))}
              </ul>
            </CardContent>

            <CardFooter className="border-t">
              <Button
                nativeButton={false}
                className="w-full"
                render={<a href={earlyAccess} />}
              >
                Join early access
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-muted-foreground">
                Without a shared foundation
              </CardTitle>
              <CardDescription className="sm:min-h-10">
                More AI can still create more fragmentation, dependency and
                repeated setup.
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
              <ul className="flex flex-col gap-3">
                {fragmentedPoints.map((point) => (
                  <CrossRow key={point} text={point} />
                ))}
              </ul>
            </CardContent>

            <CardFooter className="border-t">
              <Button
                variant="secondary"
                nativeButton={false}
                className="w-full"
                render={<a href="#how-it-works" />}
              >
                See the operating model
                <ArrowRight data-icon="inline-end" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}
