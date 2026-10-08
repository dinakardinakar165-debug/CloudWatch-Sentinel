import React, { useState } from 'react';
import { AnomalyRecord } from '../types';

interface AnomaliesViewProps {
  anomalies: AnomalyRecord[];
  onTriggerSimulation: () => void;
  isSimulating: boolean;
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  anomalies,
  onTriggerSimulation,
  isSimulating
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const highCount = anomalies.filter(a => a.severity === 'high').length;
  const mediumCount = anomalies.filter(a => a.severity === 'medium').length;
  const lowCount = anomalies.filter(a => a.severity === 'low').length;

  const filtered = anomalies.filter(a => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesSearch =
      a.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.date.includes(searchTerm);
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="anomalies-container">
      {/* Top Severity Count Cards */}
      <div className="metrics-grid">
        <div className="metric-card alert-warn">
          <div className="metric-card-header">
            <span className="metric-card-title">Critical Anomalies</span>
            <span className="metric-icon">🚨</span>
          </div>
          <div className="metric-value">{criticalCount}</div>
          <div className="metric-subtext">
            <span>Statistical Z-Score ≥ 4.0 Deviation</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">High Anomalies</span>
            <span className="metric-icon">⚠️</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>{highCount}</div>
          <div className="metric-subtext">
            <span>Statistical Z-Score ≥ 3.0 Deviation</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Medium Anomalies</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-purple)' }}>{mediumCount}</div>
          <div className="metric-subtext">
            <span>Statistical Z-Score ≥ 2.0 Deviation</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Low / Baseline</span>
            <span className="metric-icon">ℹ️</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>{lowCount}</div>
          <div className="metric-subtext">
            <span>Minor spending fluctuations</span>
          </div>
        </div>
      </div>

      {/* Math Explanation Panel */}
      <div className="math-explainer-card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
          🧠 How Statistical Z-Score Anomaly Detection Works
        </h3>
        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          The Sentinel engine calculates a population Z-score for daily cloud spending observations to detect cost spikes:
        </p>

        <div className="math-formula-box">
          Z = (X - μ) / σ
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Where <strong>X</strong> is the recorded daily spend, <strong>μ (mu)</strong> is the rolling baseline average spend, and <strong>σ (sigma)</strong> is the population standard deviation across historical observations.
          Higher Z-score values indicate stronger deviation from expected spending baselines ($Z \ge 4.0$ = Critical, $Z \ge 3.0$ = High, $Z \ge 2.0$ = Medium).
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="panel-container">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="panel-title">
            <h3>Calculated Cost Anomalies Log</h3>
            <p>Outlier cost entries identified by statistical deviation engine</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search service or date..."
              className="form-input"
              style={{ width: '200px', padding: '6px 12px', fontSize: '12.5px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (Z ≥ 4.0)</option>
              <option value="high">High (Z ≥ 3.0)</option>
              <option value="medium">Medium (Z ≥ 2.0)</option>
              <option value="low">Low</option>
            </select>

            <button
              className="btn-trigger-simulation"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={onTriggerSimulation}
              disabled={isSimulating}
            >
              ⚡ Simulate Cost Event
            </button>
          </div>
        </div>

        {/* Anomalies Data Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cloud Service</th>
                <th>Recorded Spend ($)</th>
                <th>Expected Baseline ($)</th>
                <th>Z-Score Value</th>
                <th>Severity Classification</th>
                <th>Engine Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No cost anomalies found matching current criteria. Click "Simulate Cost Event" to inject a spend spike.
                  </td>
                </tr>
              ) : (
                filtered.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.service}</strong></td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                      ${row.amount.toFixed(2)}
                    </td>
                    <td>${(row.baseline || 50.0).toFixed(2)}</td>
                    <td>
                      <strong style={{ color: row.zScore >= 4 ? 'var(--accent-rose)' : 'var(--accent-amber)' }}>
                        {row.zScore ? row.zScore.toFixed(2) : '3.50'}
                      </strong>
                    </td>
                    <td>
                      <span className={`severity-badge severity-${row.severity}`}>
                        {row.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge-pill" style={{ background: 'rgba(248,113,113,0.1)', borderColor: 'rgba(248,113,113,0.3)', color: 'var(--accent-rose)' }}>
                        ● Alert Logged
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
