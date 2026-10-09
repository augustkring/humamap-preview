import { site } from "@/content/site";

const plans = [
  {
    name: "Free Core",
    price: "€0",
    note: "Launch planning",
    description: "Start building the company foundation with your own AI provider.",
    features: ["1 company", "Up to 3 active workflows", "30-day history", "BYO AI", "No card planned"],
    cta: "Join early access",
  },
  {
    name: "Premium",
    price: "€499",
    suffix: "/ company / month",
    note: "Planning base",
    description: "For teams running recurring work and building reusable company capability.",
    features: ["Up to 25 active workflows", "12-month history", "Advanced memory", "Collaboration", "Expanded controls"],
    cta: "Talk to us",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "€30K",
    suffix: "base ACV",
    note: "Planning base",
    description: "For complex operating environments that need stronger assurance and isolation.",
    features: ["Advanced governance & IAM", "Dedicated capacity options", "SLA path", "API access", "Enterprise support"],
    cta: "Discuss enterprise",
  },
] as const;

export function PricingGrid() {
  return (
    <div className="pricing-grid">
      {plans.map((plan) => (
        <article className={plan.featured ? "price-card featured" : "price-card"} key={plan.name}>
          <div className="price-head">
            <span className="price-note">{plan.note}</span>
            <h3>{plan.name}</h3>
            <div className="price-line"><strong>{plan.price}</strong>{plan.suffix ? <span>{plan.suffix}</span> : null}</div>
            <p>{plan.description}</p>
          </div>
          <ul>
            {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
          </ul>
          <a href={site.contactHref} className={plan.featured ? "button button-dark full" : "button button-outline full"}>{plan.cta}</a>
        </article>
      ))}
    </div>
  );
}
