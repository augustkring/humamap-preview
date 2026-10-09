"use client";

import { useState } from "react";
import { foundationLayers } from "@/content/site";

export function FoundationDemo() {
  const [active, setActive] = useState<(typeof foundationLayers)[number]["id"]>("knowledge");
  const current = foundationLayers.find((layer) => layer.id === active) ?? foundationLayers[0];

  return (
    <div className="foundation-demo" aria-label="Illustrative BLENTERA product surface">
      <div className="demo-topbar">
        <div className="demo-brand">
          <span className="demo-mark" aria-hidden="true">B</span>
          <div>
            <strong>Example company</strong>
            <small>Illustrative workspace · not customer evidence</small>
          </div>
        </div>
        <div className="demo-status"><span className="status-dot" /> Foundation current</div>
      </div>

      <div className="demo-layout">
        <div className="demo-sidebar">
          <div className="demo-nav-title">Foundation</div>
          {foundationLayers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              className={active === layer.id ? "demo-nav-item active" : "demo-nav-item"}
              onClick={() => setActive(layer.id)}
              aria-pressed={active === layer.id}
            >
              <span className="demo-nav-glyph" aria-hidden="true" />
              {layer.label}
            </button>
          ))}
          <div className="demo-sidebar-foot">
            <span>Runtime</span>
            <strong>Customer managed</strong>
          </div>
        </div>

        <div className="demo-main">
          <div className="demo-breadcrumb">BLENTERA / {current.label}</div>
          <div className="demo-heading">
            <div>
              <h3>{current.title}</h3>
              <p>{current.description}</p>
            </div>
            <span className="mini-button" aria-hidden="true">Layer view</span>
          </div>

          <div className="demo-workspace">
            <div className="demo-workcard primary-workcard">
              <div className="workcard-label">Example work item</div>
              <div className="workcard-title">Quarterly pricing review</div>
              <p>Evaluate package performance against the company goal: improve qualified conversion without reducing contribution.</p>
              <div className="work-meta">
                <span>Owner <strong>Revenue Ops</strong></span>
                <span>Goal <strong>Q4 growth</strong></span>
                <span>State <strong>Reviewing</strong></span>
              </div>
              <div className="progress-line"><span /></div>
              <div className="work-steps">
                <span className="complete">Context loaded</span>
                <span className="complete">Analysis run</span>
                <span className="current">Approval requested</span>
                <span>Publish changes</span>
              </div>
            </div>

            <div className="demo-side-stack">
              <div className="demo-workcard">
                <div className="workcard-label">{current.label}</div>
                <ul className="clean-list">
                  {current.items.map((item) => <li key={item}><span className="list-marker" />{item}</li>)}
                </ul>
              </div>
              <div className="demo-workcard compact">
                <div className="workcard-label">Illustrative authority</div>
                <div className="authority-row"><span>CRM read</span><strong>Allowed</strong></div>
                <div className="authority-row"><span>Pricing change</span><strong className="review-state">Approval</strong></div>
                <div className="authority-row"><span>Spend limit</span><strong>€50/day</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
