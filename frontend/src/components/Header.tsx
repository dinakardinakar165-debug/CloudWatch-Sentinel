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
        <p>Real-time Cloud Monitoring & Z-Score Statistical Anomaly Intelligence</p>
      </div>

      <div className="top-header-right">
        <span className="demo-banner-tag">
          SIMULATED COST DATA
        </span>

        <span className="status-badge-pill">
          ● Render Platform Operational
        </span>

        {alertCount > 0 && (
          <span className="status-badge-pill" style={{ background: 'rgba(248,113,113,0.15)', borderColor: 'rgba(248,113,113,0.3)', color: 'var(--accent-rose)' }}>
            🔔 {alertCount} Active Alert{alertCount > 1 ? 's' : ''}
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
