const layers = [
  {
    number: "01",
    title: "Knowledge foundation",
    body: "Company context, connected knowledge, governed memory and task-ready context.",
    items: ["Company foundation", "Connected knowledge", "Governed memory", "Context engine"],
  },
  {
    number: "02",
    title: "Work & organisation",
    body: "Goals, tasks, projects, people, agents, roles and workflows tied to accountable outcomes.",
    items: ["Goal-aware work", "Agent organisation", "Workflows", "Connected systems"],
  },
  {
    number: "03",
    title: "Compounding intelligence",
    body: "Reviewed learning becomes reusable ways of working and, when stable, software.",
    items: ["Skills & playbooks", "Evaluations", "AI → software", "Continuous adaptation"],
  },
  {
    number: "04",
    title: "Control & portability",
    body: "Authority, evidence and execution stay controlled while providers remain replaceable.",
    items: ["Permissions", "Approvals & budgets", "Runtime choice", "Portable company layer"],
  },
] as const;

export function FoundationMap() {
  return (
    <div className="foundation-map">
      <div className="foundation-map-rail">
        <span>People</span>
        <span>Agents</span>
        <span>Models</span>
        <span>Workflows</span>
        <strong>Plug into the same company foundation</strong>
      </div>
      <div className="foundation-map-grid">
        {layers.map((layer) => (
          <article key={layer.title}>
            <div className="foundation-map-number">{layer.number}</div>
            <h3>{layer.title}</h3>
            <p>{layer.body}</p>
            <ul>
              {layer.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </article>
        ))}
      </div>
      <div className="foundation-map-base">
        <span>Company-owned foundation</span>
        <strong>Context · work · authority · learning stay usable as people and technology change.</strong>
      </div>
    </div>
  );
}
