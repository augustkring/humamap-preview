import { AgentSession } from '@/components/agent-session'
import { IconPoint } from '@/components/icon-point'
import { Stage } from '@/components/mockup'
import { Section, SectionHeading } from '@/components/section'
import { agents } from '@/content/agents'

export function Agents() {
  return (
    <Section id="agents">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-10">
          <SectionHeading
            align="start"
            sectionId="agents"
            eyebrow={agents.eyebrow}
            title={agents.title}
            description={agents.description}
          />
          <ul className="flex flex-col gap-6">
            {agents.points.map((point) => (
              <IconPoint key={point.title} {...point} />
            ))}
          </ul>
        </div>

        <div className="reveal">
          <Stage variant={2} className="h-96">
            <AgentSession />
          </Stage>
        </div>
      </div>
    </Section>
  )
}
