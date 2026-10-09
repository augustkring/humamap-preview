import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  BrainCircuit,
  Database,
  Goal,
  GitBranch,
  Network,
  ShieldCheck,
  Key,
  History,
} from "lucide-react"

type Feature = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

type FeatureTab = {
  value: string
  label: string
  features: Feature[]
}

const TABS: FeatureTab[] = [
  {
    value: "knowledge",
    label: "Knowledge",
    features: [
      {
        icon: BookOpen,
        title: "Company foundation",
        description:
          "Keep the company context people and AI should start from in one durable, reviewable layer.",
      },
      {
        icon: Database,
        title: "Connected knowledge",
        description:
          "Bring approved company information into the work without rebuilding context for every new tool.",
      },
      {
        icon: BrainCircuit,
        title: "Governed memory",
        description:
          "Useful learning can be reviewed, promoted and reused instead of disappearing into local chats or prompts.",
      },
    ],
  },
  {
    value: "work",
    label: "Work",
    features: [
      {
        icon: Goal,
        title: "Goal-aware work",
        description:
          "Keep tasks, projects and workflows connected to the outcomes the company is actually trying to achieve.",
      },
      {
        icon: Network,
        title: "People + agent organisation",
        description:
          "Give people and agents clear roles, ownership and delegation inside the same operating structure.",
      },
      {
        icon: GitBranch,
        title: "Durable workflows",
        description:
          "Run recurring work with state, retries, approvals and exception paths instead of fragile one-off automation.",
      },
    ],
  },
  {
    value: "control",
    label: "Control",
    features: [
      {
        icon: Key,
        title: "Permissions & approvals",
        description:
          "Keep identity, authority, budgets and human checkpoints outside the model and visible to the company.",
      },
      {
        icon: History,
        title: "Evidence & audit",
        description:
          "Retain the operating evidence needed to understand what acted, what context was used and what happened.",
      },
      {
        icon: ShieldCheck,
        title: "Portable execution",
        description:
          "Change models, agents or runtimes without throwing away the company layer underneath them.",
      },
    ],
  },
]

export default function Features() {
  return (
    <section
      id="product"
      className="flex w-full items-center justify-center px-6 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 block text-xs font-semibold tracking-widest text-muted-foreground uppercase">
            The foundation
          </span>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            One company layer that stays useful
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
            Keep company context, work, learning and control together while the
            people and AI technology around them change.
          </p>
        </div>

        <Tabs defaultValue="knowledge" className="mt-10 w-full items-center">
          <TabsList className="h-auto flex-wrap gap-1 rounded-lg p-1">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-md px-4 py-1.5 text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-8">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {tab.features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <Card
                      key={feature.title}
                      className="group h-full gap-4 p-6 transition-colors hover:border-primary/40"
                    >
                      <div
                        className={cn(
                          "flex size-11 items-center justify-center rounded-md",
                          "bg-primary/10 text-primary transition-colors",
                          "group-hover:bg-primary group-hover:text-primary-foreground"
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-heading text-base font-medium">
                          {feature.title}
                        </h3>
                        <p className="text-sm/relaxed text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                      <div className="mt-auto flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <GitBranch className="size-3.5" />
                        Shared company capability
                      </div>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
