import type { Metadata } from "next";
import { PricingGrid } from "@/components/PricingGrid";

export const metadata: Metadata = {
  title: "Pricing",
  description: "BLENTERA launch pricing plan: Free Core, Premium and Enterprise.",
};

export default function PricingPage() {
  return (
    <>
      <section className="subpage-hero">
        <div className="shell">
          <span className="category-kicker">Pricing</span>
          <h1>Start with the foundation. Pay when capability grows.</h1>
          <p>The current model is a company subscription with optional capacity and service layers. All public prices remain launch-planning hypotheses until validated with customers.</p>
        </div>
      </section>
      <section className="section pricing-section">
        <div className="shell"><PricingGrid /></div>
      </section>
      <section className="section">
        <div className="shell pricing-notes">
          <article><span>BYO AI</span><h2>Keep model spend direct.</h2><p>The default model assumes customers bring their own model/provider access, so provider spend does not become hidden BLENTERA margin.</p></article>
          <article><span>Optional runtime</span><h2>Hosted execution can be separate.</h2><p>Managed runtime is planned as an optional capacity layer rather than being forced into the core subscription.</p></article>
          <article><span>Visible limits</span><h2>Usage should stay understandable.</h2><p>Workflow, history and capacity limits should be visible before overage or plan changes.</p></article>
        </div>
      </section>
    </>
  );
}
