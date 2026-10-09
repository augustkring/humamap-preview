"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Database, SlidersHorizontal, Play, RotateCcw, Check } from "lucide-react"

type IconProps = { className?: string; size?: number | string }

const steps = [
  {
    icon: (p: IconProps) => <Database {...p} />,
    title: "Connect company knowledge",
    copy: "Give people and AI the same approved company context and connected knowledge to start from.",
  },
  {
    icon: (p: IconProps) => <SlidersHorizontal {...p} />,
    title: "Define work and authority",
    copy: "Set goals, roles, workflows, permissions, approvals and budgets before execution begins.",
  },
  {
    icon: (p: IconProps) => <Play {...p} />,
    title: "Run real work",
    copy: "Use software for stable steps and AI where judgement is useful, with state and exceptions kept visible.",
  },
  {
    icon: (p: IconProps) => <RotateCcw {...p} />,
    title: "Review and reuse",
    copy: "Turn useful outcomes into reviewed memory, reusable standards and better starting points for the next run.",
  },
]

export default function HowItWorks() {
  const [active, setActive] = useState(0)
  const progress = ((active + 0.5) / steps.length) * 100

  return (
    <section
      id="how-it-works"
      className="flex w-full items-center justify-center px-6 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-12 text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            How BLENTERA works
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            From company context to compounding capability
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The point is not another AI tool. It is a durable operating layer
            that makes the next person, agent, model or workflow start from
            what the company already knows.
          </p>
        </div>

        <ol
          className={cn("relative flex flex-col gap-8", "md:flex-row md:gap-0")}
        >
          <div
            className="absolute top-0 left-[1.25rem] hidden h-full w-px bg-border md:top-5 md:left-0 md:h-px md:w-full"
            aria-hidden="true"
          />
          <div
            className="absolute top-0 left-[1.25rem] hidden h-full w-px origin-top bg-primary transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] md:top-5 md:left-0 md:h-px md:w-auto"
            style={{ transform: `scaleY(${progress / 100})` }}
            aria-hidden="true"
          />
          <div
            className="absolute top-5 left-0 hidden h-px w-full origin-left bg-primary transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] md:block"
            style={{ transform: `scaleX(${progress / 100})` }}
            aria-hidden="true"
          />

          {steps.map(({ icon: Icon, title, copy }, index) => {
            const isDone = index <= active
            const isCurrent = index === active
            return (
              <li
                key={title}
                className="relative flex flex-1 gap-4 md:flex-col md:items-center md:gap-0 md:px-3 md:text-center"
              >
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn(
                    "z-10 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border p-0 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                    isDone
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                    isCurrent &&
                      "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {isDone ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    <Icon className="size-4" aria-hidden="true" />
                  )}
                  <span className="sr-only">{title}</span>
                </button>

                <div className="md:mt-4">
                  <h3
                    className={cn(
                      "mt-0.5 font-heading text-sm font-semibold transition-colors",
                      isCurrent || isDone
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground md:mx-auto md:max-w-[16rem]">
                    {copy}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
