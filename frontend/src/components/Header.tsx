import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTriggerSimulation: () => void;
  isSimulating: boolean;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTriggerSimulation,
  isSimulating,
  alertCount
}) => {
  return (
    <header className="top-header">
      <div className="top-header-left">
        <h2>{activeTab}</h2>
        <p>Cloud Cost Intelligence & Z-Score Anomaly Telemetry Dashboard</p>
      </div>

      <div className="top-header-right">
        <span className="demo-banner-tag">
          Data source: Synthetic Demo Data
        </span>

        <span className="status-badge-pill" style={{ background: 'var(--brand-subtle)', borderColor: 'var(--brand-border)', color: 'var(--brand-blue)' }}>
          Environment: Local Development
        </span>

        <span className="status-badge-pill">
          Cloud platform: Render
        </span>

        {alertCount > 0 && (
          <span className="status-badge-pill" style={{ background: 'var(--critical-bg)', borderColor: 'var(--critical-border)', color: 'var(--critical-color)' }}>
            🔔 {alertCount} Alert{alertCount > 1 ? 's' : ''}
          </span>
        )}

        <button
          className="btn-trigger-simulation"
          onClick={onTriggerSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? '⏳ Computing Event...' : '⚡ Simulate Cost Event'}
        </button>
      </div>
    </header>
  );
};
