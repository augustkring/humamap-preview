"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Check } from "lucide-react"

const earlyAccess =
  "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access"

const TRUST_ITEMS = [
  "Shared company context",
  "Reviewed company memory",
  "Replaceable models and runtimes",
]

const SCREENSHOT_ROWS = [
  {
    label: "Context",
    value: "Shared",
    change: "Company foundation",
  },
  {
    label: "Work",
    value: "Persistent",
    change: "Goals + workflows",
  },
  {
    label: "Memory",
    value: "Reviewed",
    change: "Useful learning",
  },
  {
    label: "Control",
    value: "Explicit",
    change: "Permissions + approvals",
  },
]

const BAR_HEIGHTS = [28, 36, 34, 45, 43, 52, 57, 61, 66, 73, 78, 86]

const FOUNDATION_LAYERS = [
  { name: "Knowledge", pct: 92, state: "shared" },
  { name: "Work", pct: 78, state: "linked" },
  { name: "Control", pct: 66, state: "governed" },
]

export default function Hero() {
  return (
    <section className="flex w-full items-center justify-center px-6 py-16 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 md:grid-cols-2 md:items-center md:gap-16">
        <div className="flex flex-col">
          <Badge variant="outline" className="w-fit">
            Company AI foundation
          </Badge>

          <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Build your company&apos;s AI capability once.
            <br className="hidden sm:block" /> Keep building on it.
          </h1>

          <p className="mt-5 text-lg text-muted-foreground">
            BLENTERA keeps company knowledge, work, governance and learning
            usable across people, agents, models and tools, so new capabilities
            start from what the company already knows and controls.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              render={<a href={earlyAccess} />}
              nativeButton={false}
              className="w-full sm:w-auto"
            >
              Join early access
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
            <Button
              render={<a href="#how-it-works" />}
              nativeButton={false}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              See how it works
            </Button>
          </div>

          <Separator className="my-8" />

          <ul className="flex flex-col gap-2.5">
            {TRUST_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Check
                  className="size-4 shrink-0 text-foreground"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative" aria-label="Illustrative BLENTERA product view">
          <div className="rounded-xl border border-border bg-card p-1">
            <div className="flex items-center gap-1.5 rounded-t-lg border-b border-border bg-muted px-3 py-2">
              <span className="size-2.5 border border-border bg-background" />
              <span className="size-2.5 border border-border bg-background" />
              <span className="size-2.5 border border-border bg-background" />
              <span className="ml-3 flex-1 truncate rounded-md border border-border bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                Company foundation / overview
              </span>
            </div>

            <div className="flex flex-col rounded-b-lg bg-background p-4">
              <div className="grid grid-cols-2 gap-3">
                {SCREENSHOT_ROWS.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col rounded-lg border border-border bg-card p-3"
                  >
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className="mt-1 text-lg font-bold">{row.value}</p>
                    <p className="mt-0.5 text-xs whitespace-nowrap text-muted-foreground">
                      {row.change}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold">Capability reuse</p>
                  <Badge variant="secondary" className="text-xs">
                    Across use cases
                  </Badge>
                </div>
                <div className="flex h-28 items-end gap-1">
                  {BAR_HEIGHTS.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-foreground/15"
                      style={{ height: `${h}%` }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between">
                  {["Start", "People", "Agents", "Models", "Tools", "Next"].map(
                    (label) => (
                      <span
                        key={label}
                        className="text-xs text-muted-foreground"
                      >
                        {label}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2">
                  <p className="text-xs font-semibold">Foundation layers</p>
                  <span className="text-[10px] text-muted-foreground">
                    Illustrative
                  </span>
                </div>
                {FOUNDATION_LAYERS.map((row) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-3 border-b border-border px-4 py-2 last:border-0"
                  >
                    <span className="w-24 truncate text-xs">{row.name}</span>
                    <div className="flex-1 border border-border bg-muted">
                      <div
                        className="h-1.5 bg-foreground/40"
                        style={{ width: `${row.pct}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="w-14 text-right text-xs text-muted-foreground">
                      {row.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            className="absolute -right-3 -bottom-3 -z-10 size-full rounded-xl border border-border bg-muted"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  )
}
