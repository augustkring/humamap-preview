import Link from "next/link";
import { ControlDemo } from "@/components/ControlDemo";
import { Faq } from "@/components/Faq";
import { FoundationDemo } from "@/components/FoundationDemo";
import { FoundationMap } from "@/components/FoundationMap";
import { PricingGrid } from "@/components/PricingGrid";
import { StandardsDemo } from "@/components/StandardsDemo";
import { WorkflowDemo } from "@/components/WorkflowDemo";
import { outcomes, site } from "@/content/site";

const problemRows = [
  ["Context", "Reconnect data, documents, prompts and company facts."],
  ["Control", "Recreate permissions, approvals, audit and accountability."],
  ["Work", "Rebuild integrations, orchestration and exception handling."],
  ["Learning", "Useful learning stays trapped in people, tools or local agent memory."],
] as const;

const memorySteps = [
  ["01", "Work", "Do the job from shared company context."],
  ["02", "Outcome", "See what happened and keep the evidence."],
  ["03", "Review", "Keep useful learning. Correct what was wrong."],
  ["04", "Shared memory", "Promote reviewed learning into company memory."],
  ["05", "Next run", "Start from what the company has already learned."],
] as const;

const softwareSteps = [
  ["Novel", "AI reasons", "Judgement is still needed."],
  ["Repeated", "Pattern appears", "A stable shape becomes visible."],
  ["Standardised", "Workflow captures it", "The company defines the repeatable path."],
  ["Compiled", "Software runs it", "Deterministic code handles stable steps."],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="shell hero-copy">
          <div className="category-kicker">Company AI foundation</div>
          <h1>Build your company&apos;s AI capability once. <span>Keep building on it.</span></h1>
          <p className="hero-lead">BLENTERA keeps company knowledge, work, governance and learning usable across people, agents, models and tools — so every new capability starts from what your company already knows, controls and has learned.</p>
          <div className="hero-actions">
            <a href={site.primaryCta.href} className="button button-dark button-large">{site.primaryCta.label}</a>
            <Link href="/product" className="button button-outline button-large">Explore the product</Link>
          </div>
          <div className="hero-proofline">
            <span>Shared company context</span><i />
            <span>Real work</span><i />
            <span>Governed learning</span><i />
            <span>Replaceable AI</span>
          </div>
        </div>
        <div className="shell hero-product">
          <FoundationDemo />
        </div>
      </section>

      <section className="section section-problem" id="how-it-works">
        <div className="shell split-intro">
          <div>
            <span className="section-index">01 / Why BLENTERA</span>
            <h2>Every new AI use case shouldn&apos;t start from zero.</h2>
          </div>
          <p>AI adoption can increase while company capability stays fragmented. BLENTERA separates the durable company layer from the people and technology that change around it.</p>
        </div>
        <div className="shell problem-table">
          <div className="problem-column problem-left">
            <div className="table-head"><span>Without a shared foundation</span><strong>Every use case rebuilds the stack</strong></div>
            {problemRows.map(([title, body]) => <div className="problem-row" key={title}><strong>{title}</strong><p>{body}</p></div>)}
          </div>
          <div className="problem-arrow" aria-hidden="true">→</div>
          <div className="problem-column problem-right">
            <div className="table-head"><span>With BLENTERA</span><strong>One company layer stays useful</strong></div>
            <div className="foundation-rows">
              {["Foundation", "Work", "Organisation", "Governance", "Capability", "Execution"].map((item, index) => (
                <div className="foundation-row" key={item}><strong>{String(index + 1).padStart(2, "0")}</strong><span>{item}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="outcome-strip">
        <div className="shell outcome-grid">
          {outcomes.map((outcome, index) => (
            <article key={outcome.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{outcome.title}</h3>
              <p>{outcome.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="shell split-intro">
          <div>
            <span className="section-index">02 / The foundation</span>
            <h2>One shared foundation for people, agents and future AI.</h2>
          </div>
          <p>The company layer keeps context, work, organisation, control and learning connected while execution technology remains replaceable.</p>
        </div>
        <div className="shell section-product">
          <FoundationMap />
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell split-intro light">
          <div>
            <span className="section-index">03 / Operational foundation</span>
            <h2>Built around real work, not another knowledge portal.</h2>
          </div>
          <p>Work remains goal-aware, persistent, accountable and controllable across people and AI.</p>
        </div>
        <div className="shell">
          <WorkflowDemo />
        </div>
      </section>

      <section className="section">
        <div className="shell editorial-intro">
          <span className="section-index">04 / Compounding intelligence</span>
          <h2>Useful work should make the next run better.</h2>
          <p>Value compounds when real work becomes reviewed knowledge and reusable company capability.</p>
        </div>
        <div className="shell process-line">
          {memorySteps.map(([number, title, body]) => (
            <article key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="shell memory-example" aria-label="Illustrative learning example">
          <div className="memory-before">
            <span className="mono-label">ILLUSTRATIVE RUN OBSERVATION</span>
            <strong>A recurring procurement requirement is slowing proposal work for one market segment.</strong>
            <p>Example only. The website does not present this as customer evidence.</p>
          </div>
          <div className="memory-arrow" aria-hidden="true">→</div>
          <div className="memory-after">
            <span className="mono-label">REVIEWED COMPANY MEMORY</span>
            <strong>Check procurement requirements before proposal creation for the affected segment.</strong>
            <div><span>Reviewed by an accountable owner</span><span>Versioned learning</span></div>
          </div>
        </div>
      </section>

      <section className="section standards-section">
        <div className="shell split-intro">
          <div>
            <span className="section-index">05 / Reusable standards</span>
            <h2>Turn proven practice into company capability.</h2>
          </div>
          <p>Useful ways of working should not disappear into a prompt or one employee&apos;s memory. BLENTERA keeps standards versioned, reviewable and reusable across people and AI.</p>
        </div>
        <div className="shell standards-wrap">
          <StandardsDemo />
        </div>
      </section>

      <section className="section software-section">
        <div className="shell split-intro">
          <div>
            <span className="section-index">06 / AI → software</span>
            <h2>Move stable work out of AI.</h2>
          </div>
          <p>AI handles judgement while work is novel. As patterns stabilise, BLENTERA can move known steps into deterministic workflows and software.</p>
        </div>
        <div className="shell maturity-track">
          {softwareSteps.map(([title, subtitle, body], index) => (
            <article key={title}>
              <div className="maturity-number">{String(index + 1).padStart(2, "0")}</div>
              <h3>{title}</h3>
              <strong>{subtitle}</strong>
              <p>{body}</p>
            </article>
          ))}
        </div>
        <div className="shell maturity-rule">
          <span>More AI reasoning</span><div><i /></div><span>More software execution</span>
        </div>
      </section>

      <section className="section control-section">
        <div className="shell split-intro">
          <div>
            <span className="section-index">07 / Control</span>
            <h2>Autonomy should have boundaries you can see.</h2>
          </div>
          <p>Purpose, permissions, approval gates, budgets and evidence sit outside the model. The model can propose. The company remains the authority.</p>
        </div>
        <div className="shell control-layout">
          <ControlDemo />
          <div className="control-copy">
            <div className="control-point"><span>01</span><div><strong>Know the use case</strong><p>Purpose, owner, intended use and readiness stay explicit.</p></div></div>
            <div className="control-point"><span>02</span><div><strong>Control the action</strong><p>Identity, permissions, approvals and budgets constrain execution.</p></div></div>
            <div className="control-point"><span>03</span><div><strong>Verify the outcome</strong><p>Evidence, audit, supervision and postconditions show what happened.</p></div></div>
            <div className="control-point"><span>04</span><div><strong>Keep control</strong><p>Model choice, runtime choice and export paths keep the company layer portable.</p></div></div>
          </div>
        </div>
        <div className="shell portability-band">
          <div>
            <span className="section-index">Portability</span>
            <h3>Change the technology. Keep the company capability.</h3>
          </div>
          <div className="provider-row">
            <span>Models</span><span>Agents</span><span>Runtimes</span><span>Systems</span>
            <strong>BLENTERA foundation stays</strong>
          </div>
        </div>
      </section>

      <section className="section pricing-section">
        <div className="shell editorial-intro">
          <span className="section-index">08 / Pricing</span>
          <h2>Free to start. Pay as company capability and control grow.</h2>
          <p>Pricing below reflects the current launch plan and remains a hypothesis until customer evidence validates the model.</p>
        </div>
        <div className="shell"><PricingGrid /></div>
      </section>

      <section className="section faq-section">
        <div className="shell faq-layout">
          <div>
            <span className="section-index">09 / Questions</span>
            <h2>What BLENTERA is — and what it is not.</h2>
          </div>
          <Faq />
        </div>
      </section>

      <section className="closing-section">
        <div className="shell closing-inner">
          <span className="category-kicker">BLENTERA</span>
          <h2>Make AI capability a company asset that compounds.</h2>
          <p>Build the shared foundation once. Keep improving it as people, agents, models and workflows change.</p>
          <div className="hero-actions">
            <a href={site.primaryCta.href} className="button button-light button-large">{site.primaryCta.label}</a>
            <Link href="/product" className="button button-dark-outline button-large">Explore the product</Link>
          </div>
        </div>
      </section>
    </>
  );
}
