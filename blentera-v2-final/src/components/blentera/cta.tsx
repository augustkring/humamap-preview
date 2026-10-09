import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const earlyAccess =
  "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access"

export default function Cta() {
  return (
    <section className="flex w-full items-center justify-center px-6 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-6xl rounded-xl border border-border bg-muted/30 px-6 py-14 text-center sm:px-12 sm:py-20">
        <Badge variant="outline" className="mb-4 tracking-widest uppercase">
          Early access
        </Badge>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Make AI capability a company asset that compounds.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Build the shared foundation once, then keep improving it as people,
          agents, models and workflows change.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            render={<a href={earlyAccess} />}
            nativeButton={false}
            className="w-full sm:w-auto"
          >
            Join early access
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            render={<a href="#product" />}
            nativeButton={false}
            className="w-full sm:w-auto"
          >
            Explore the product
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground">
          Early access while production qualification is completed.
        </p>
      </div>
    </section>
  )
}
