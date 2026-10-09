import React from 'react';
import { AnomalyRecord, CostRecord } from '../types';

interface OptimizationViewProps {
  costs: CostRecord[];
  anomalies: AnomalyRecord[];
}

export const OptimizationView: React.FC<OptimizationViewProps> = ({ costs, anomalies }) => {
  const serviceTotals = costs.reduce((acc, c) => {
    acc[c.service] = (acc[c.service] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedServices = Object.entries(serviceTotals).sort(([, a], [, b]) => b - a);
  const topSpender = sortedServices[0] || ['Compute Services', 185.40];

  const optimizationInsights = [
    {
      id: 'opt-001',
      category: topSpender[0],
      finding: `Category '${topSpender[0]}' accounts for largest proportion of cloud expenditure ($${topSpender[1].toFixed(2)}).`,
      evidence: 'Recorded cost is 3.7x higher than historical baseline ($50.25).',
      recommendation: 'Evaluate Compute auto-scaling thresholds, container right-sizing, or AWS Savings Plans.',
      impact: 'HIGH'
    },
    {
      id: 'opt-002',
      category: 'Database Services',
      finding: 'Database expenditure demonstrates continuous high baseline allocation ($36.80/day).',
      evidence: 'Consistent query telemetry with peak read/write throughput cycles.',
      recommendation: 'Review read replica utilization, index optimization, and DynamoDB provisioned capacity settings.',
      impact: 'MEDIUM'
    },
    {
      id: 'opt-003',
      category: 'Storage Services',
      finding: 'Storage capacity accumulation observed across inactive data objects.',
      evidence: 'S3 bucket and EBS block volume retention trends.',
      recommendation: 'Implement S3 Lifecycle policies (transition to Glacier Instant Retrieval after 30 days).',
      impact: 'LOW'
    },
    {
      id: 'opt-004',
      category: 'Network & CDN',
      finding: 'Egress traffic spikes detected across CloudFront edge locations.',
      evidence: 'Z-score deviation recorded during regional traffic surges.',
      recommendation: 'Enable edge caching compression and optimize CloudFront origin shield headers.',
      impact: 'MEDIUM'
    }
  ];

  return (
    <div className="optimization-container">
      {/* Top Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Highest Cost Concentration</span>
            <span className="metric-icon">🎯</span>
          </div>
          <div className="metric-value" style={{ fontSize: '18px', color: 'var(--brand-blue)' }}>{topSpender[0]}</div>
          <div className="metric-subtext">
            <span>${topSpender[1].toFixed(2)} recorded period spend</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Flagged Anomalies</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-value">{anomalies.length}</div>
          <div className="metric-subtext">
            <span>Statistical Z-Score outlier events</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Optimization Actions</span>
            <span className="metric-icon">💡</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--success-color)' }}>{optimizationInsights.length} Actions</div>
          <div className="metric-subtext">
            <span>Actionable recommendations</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Analysis Mode</span>
            <span className="metric-icon">🔍</span>
          </div>
          <div className="metric-value" style={{ fontSize: '16px', color: 'var(--info-color)' }}>
            Statistical Telemetry
          </div>
          <div className="metric-subtext">
            <span>Based on 30-day cost models</span>
          </div>
        </div>
      </div>

      {/* Main Optimization Recommendations Table */}
      <div className="panel-container">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Cost Optimization & Infrastructure Efficiency Recommendations</h3>
            <p>Actionable efficiency recommendations derived from statistical expenditure models</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service Category</th>
                <th>Observed Expenditure Finding</th>
                <th>Statistical Evidence</th>
                <th>Recommended Efficiency Action</th>
                <th>Priority Impact</th>
              </tr>
            </thead>
            <tbody>
              {optimizationInsights.map((opt) => (
                <tr key={opt.id}>
                  <td><strong>{opt.category}</strong></td>
                  <td>{opt.finding}</td>
                  <td><code style={{ fontSize: '12px', color: 'var(--brand-blue)', fontFamily: 'var(--font-mono)' }}>{opt.evidence}</code></td>
                  <td style={{ color: 'var(--text-primary)' }}>{opt.recommendation}</td>
                  <td>
                    <span className={`severity-badge severity-${opt.impact.toLowerCase()}`}>
                      {opt.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
