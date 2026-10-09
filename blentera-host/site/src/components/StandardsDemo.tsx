const stages = [
  {
    number: "01",
    title: "Playbook",
    body: "A reviewed way of working is written down as company-owned practice.",
  },
  {
    number: "02",
    title: "Skill",
    body: "The procedure becomes agent-ready without losing its company context.",
  },
  {
    number: "03",
    title: "Evaluate",
    body: "Real outcomes and test runs show whether the capability still works.",
  },
  {
    number: "04",
    title: "Approve",
    body: "A named owner versions the standard before it becomes shared capability.",
  },
  {
    number: "05",
    title: "Reuse",
    body: "People, agents and future workflows can start from the approved standard.",
  },
] as const;

export function StandardsDemo() {
  return (
    <div className="standards-demo" aria-label="Reusable company standards lifecycle">
      <div className="standards-topline">
        <div>
          <span className="mono-label">COMPANY STANDARD</span>
          <strong>Enterprise proposal qualification</strong>
        </div>
        <div className="standard-version">
          <span>Current</span>
          <strong>v1.4</strong>
        </div>
      </div>
      <div className="standards-track">
        {stages.map((stage) => (
          <article key={stage.title}>
            <span>{stage.number}</span>
            <h3>{stage.title}</h3>
            <p>{stage.body}</p>
          </article>
        ))}
      </div>
      <div className="standards-foot">
        <span>Improvement loop</span>
        <strong>What works becomes a versioned standard. New evidence can improve or supersede it.</strong>
      </div>
    </div>
  );
}
