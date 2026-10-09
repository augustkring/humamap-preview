export const site = {
  name: "BLENTERA",
  category: "Company AI foundation",
  description:
    "BLENTERA keeps company knowledge, work, governance and learning usable across people, agents, models and tools.",
  navigation: [
    { label: "Product", href: "/product" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Control", href: "/control" },
    { label: "Pricing", href: "/pricing" },
  ],
  contactEmail: "ak@augustkring.com",
  contactHref: "mailto:ak@augustkring.com?subject=BLENTERA",
  primaryCta: {
    label: "Join early access",
    href: "mailto:ak@augustkring.com?subject=BLENTERA%20early%20access",
  },
} as const;

export const outcomes = [
  {
    title: "More capacity",
    body: "Increase useful output without growing headcount and coordination overhead at the same rate.",
  },
  {
    title: "Less dependency",
    body: "Keep critical know-how usable when employees, tools or providers change.",
  },
  {
    title: "Better every time",
    body: "Useful work can improve what the company knows, standardises and reuses next time.",
  },
  {
    title: "Stay in control",
    body: "Purpose, permissions, evidence and portability are designed into the operating foundation.",
  },
] as const;

export const foundationLayers = [
  {
    id: "knowledge",
    label: "Knowledge foundation",
    title: "What the company knows and remembers.",
    description:
      "Approved company context, connected knowledge and governed memory give people and AI a shared starting point.",
    items: ["Company foundation", "Connected knowledge", "Governed memory", "Context engine"],
  },
  {
    id: "work",
    label: "Work & organisation",
    title: "How people and AI coordinate real work.",
    description:
      "Goals, tasks, projects, roles, agents and workflows stay connected to accountable outcomes.",
    items: ["Goal-aware work", "Agent organisation", "Workflows", "Connected systems"],
  },
  {
    id: "learning",
    label: "Compounding intelligence",
    title: "How company capability improves through use.",
    description:
      "Useful outcomes can become reviewed memory, reusable playbooks, evaluated skills and eventually software.",
    items: ["Skills & playbooks", "Learning & evaluations", "AI to software", "Continuous adaptation"],
  },
  {
    id: "control",
    label: "Control & portability",
    title: "How authority stays with the company.",
    description:
      "Permissions, approvals, budgets, evidence and runtime choices constrain action while keeping providers replaceable.",
    items: ["Governance & authority", "Controlled autonomy", "Runtime choice", "Portable company layer"],
  },
] as const;

export const faqs = [
  {
    question: "Is BLENTERA an AI agent platform?",
    answer:
      "Agents are one execution option. BLENTERA is the company foundation underneath them: shared context, work, governance, learning and portable execution.",
  },
  {
    question: "Does BLENTERA replace our existing AI tools?",
    answer:
      "The product is designed around replaceable models, agents and runtimes. The goal is to keep the company layer useful while the surrounding technology changes.",
  },
  {
    question: "Is BLENTERA production-ready today?",
    answer:
      "The current product foundation exists, but the master product status remains production NO-GO until qualification, live operating evidence and customer gates are complete.",
  },
  {
    question: "Does BLENTERA guarantee EU AI Act compliance?",
    answer:
      "No. BLENTERA is designed to provide controls and evidence that can support responsible operation. Exact legal obligations depend on the organisation, role and use case.",
  },
  {
    question: "Can we use our own models or runtime?",
    answer:
      "Provider portability is a core design principle. Customer-owned model/provider access and customer-managed runtime options are part of the product direction.",
  },
  {
    question: "Why does the website say early access instead of start free?",
    answer:
      "The Master Deck plans a no-card Free Core, but production readiness is still gated. The public CTA stays conservative until that gate changes.",
  },
] as const;
