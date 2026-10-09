const steps = [
  ["01", "Trigger", "Event or schedule"],
  ["02", "Context", "Get the right company data"],
  ["03", "Software", "Run known deterministic steps"],
  ["04", "Agent", "Handle judgement"],
  ["05", "Approval", "Human when needed"],
  ["06", "Action", "Update systems"],
] as const;

export function WorkflowDemo() {
  return (
    <div className="workflow-demo">
      <div className="workflow-demo-head">
        <div>
          <span className="mono-label">ILLUSTRATIVE RUN / WEEKLY-PIPELINE-REVIEW</span>
          <strong>In progress</strong>
        </div>
        <span className="run-id">run_1842</span>
      </div>
      <div className="workflow-track">
        {steps.map(([number, title, body], index) => (
          <div className="workflow-step" key={title}>
            <div className={index < 4 ? "step-index complete" : index === 4 ? "step-index current" : "step-index"}>{number}</div>
            <div>
              <strong>{title}</strong>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="workflow-log">
        <div><span>08:31:04</span><p>Company context loaded from approved sources.</p><strong>done</strong></div>
        <div><span>08:31:06</span><p>Deterministic revenue checks completed.</p><strong>done</strong></div>
        <div><span>08:31:18</span><p>Agent produced recommendation with evidence.</p><strong>done</strong></div>
        <div><span>08:31:19</span><p>Discount exceeds policy threshold. Approval required.</p><strong className="pending">waiting</strong></div>
      </div>
    </div>
  );
}
