import type { Metadata } from "next";
import { ControlDemo } from "@/components/ControlDemo";

export const metadata: Metadata = {
  title: "Control",
  description: "BLENTERA control and portability: purpose, permissions, approvals, budgets, evidence and replaceable execution.",
};

const controlAreas = [
  ["Purpose and ownership", "Give each material AI use case a named purpose, owner and operating boundary."],
  ["Identity and permissions", "Bind people, agents and workflows to explicit authority instead of trusting a prompt."],
  ["Approvals and budgets", "Require human checkpoints or spending limits where consequence or policy demands it."],
  ["Evidence and audit", "Record what acted, which context was used and what result followed."],
  ["Portable execution", "Keep company context and governance independent from any single model, agent or runtime."],
  ["Isolation", "Keep company-scoped data, authority and operating state separated between organisations."],
] as const;

export default function ControlPage() {
  return (
    <>
      <section className="subpage-hero">
        <div className="shell">
          <span className="category-kicker">Control & portability</span>
          <h1>Let AI act without making AI the authority.</h1>
          <p>BLENTERA is designed to keep consequential controls deterministic: identity, permissions, approvals, budgets, evidence and stop paths sit outside the model.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell control-layout"><ControlDemo />
          <div className="control-copy">
            {controlAreas.slice(0, 4).map(([title, body], index) => (
              <div className="control-point" key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{body}</p></div></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="shell two-up-panels">
          {controlAreas.slice(4).map(([title, body]) => <article key={title}><span className="section-index">Design principle</span><h2>{title}</h2><p>{body}</p></article>)}
        </div>
      </section>
      <section className="section disclaimer-section">
        <div className="shell disclaimer">
          <strong>European operation, not a compliance guarantee.</strong>
          <p>BLENTERA can provide controls and evidence. Exact obligations under the EU AI Act, data protection law, sector rules and contracts depend on the organisation, role and use case.</p>
        </div>
      </section>
    </>
  );
}
