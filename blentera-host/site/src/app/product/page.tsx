import type { Metadata } from "next";
import { FoundationDemo } from "@/components/FoundationDemo";
import { WorkflowDemo } from "@/components/WorkflowDemo";
import { foundationLayers } from "@/content/site";

export const metadata: Metadata = {
  title: "Product",
  description: "Explore the BLENTERA company AI foundation: knowledge, work, compounding intelligence, control and portability.",
};

export default function ProductPage() {
  return (
    <>
      <section className="subpage-hero">
        <div className="shell">
          <span className="category-kicker">Product</span>
          <h1>The company layer beneath changing AI technology.</h1>
          <p>BLENTERA keeps knowledge, work, organisation, governance and learning in one durable foundation while agents, models and runtimes remain replaceable.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell"><FoundationDemo /></div>
      </section>
      <section className="section">
        <div className="shell layer-list">
          {foundationLayers.map((layer, index) => (
            <article key={layer.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{layer.label}</h2>
                <h3>{layer.title}</h3>
                <p>{layer.description}</p>
                <ul>{layer.items.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="section dark-section">
        <div className="shell editorial-intro light">
          <span className="section-index">Operational foundation</span>
          <h2>Real work has state, owners and failure paths.</h2>
          <p>Durable work can wait, retry, fall back or escalate instead of silently stopping.</p>
        </div>
        <div className="shell"><WorkflowDemo /></div>
      </section>
    </>
  );
}
