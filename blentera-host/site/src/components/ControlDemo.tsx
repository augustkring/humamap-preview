export function ControlDemo() {
  return (
    <div className="control-demo">
      <div className="control-head">
        <div>
          <span className="mono-label">ILLUSTRATIVE AGENT POLICY</span>
          <h3>Revenue Operator</h3>
        </div>
        <span className="policy-state">Active</span>
      </div>
      <div className="control-body">
        <div className="policy-group">
          <span>Can act without approval</span>
          <div className="policy-row"><span>Read CRM and approved knowledge</span><strong>Allowed</strong></div>
          <div className="policy-row"><span>Update opportunity fields</span><strong>Allowed</strong></div>
          <div className="policy-row"><span>Draft customer proposal</span><strong>Allowed</strong></div>
        </div>
        <div className="policy-group">
          <span>Human checkpoint</span>
          <div className="policy-row"><span>Discount greater than 10%</span><strong className="needs-approval">Approval</strong></div>
          <div className="policy-row"><span>Send contract externally</span><strong className="needs-approval">Approval</strong></div>
          <div className="policy-row"><span>Delete customer record</span><strong className="blocked-state">Blocked</strong></div>
        </div>
        <div className="policy-metrics">
          <div><span>Budget</span><strong>€50 / day</strong></div>
          <div><span>Example actions</span><strong>184</strong></div>
          <div><span>Example reviews</span><strong>12</strong></div>
        </div>
      </div>
    </div>
  );
}
