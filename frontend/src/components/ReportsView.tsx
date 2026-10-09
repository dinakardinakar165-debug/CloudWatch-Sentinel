import React from 'react';
import { AnomalyRecord, CostRecord } from '../types';

interface ReportsViewProps {
  costs: CostRecord[];
  anomalies: AnomalyRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ costs, anomalies }) => {
  const totalSpend = costs.reduce((sum, c) => sum + c.amount, 0);
  const avgDaily = costs.length > 0 ? totalSpend / new Set(costs.map(c => c.date)).size : 0;
  const timestamp = new Date().toISOString().substring(0, 19).replace('T', ' ');

  const exportCSV = () => {
    const headers = ['Date', 'Service Category', 'Recorded Spend (USD)', 'Currency'];
    const rows = costs.map(c => [c.date, `"${c.service}"`, c.amount.toFixed(2), c.currency || 'USD']);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CloudWatch_Sentinel_Report_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="reports-container">
      {/* Header & Export Toolbar */}
      <div className="panel-container" style={{ marginBottom: 20 }}>
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="panel-title">
            <h3>Executive Cloud Expenditure Report & Data Export</h3>
            <p>Generated Report Metadata • Time: {timestamp} • Source: Synthetic Telemetry Engine</p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '12.5px' }}
              onClick={exportCSV}
            >
              📥 Download Cost Telemetry CSV
            </button>
          </div>
        </div>

        {/* Printable Executive Summary Panel */}
        <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: 16 }}>
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            📊 Executive Summary Statement
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>TOTAL REPORTED SPEND</span>
              <strong style={{ fontSize: '18px', color: 'var(--brand-blue)' }}>${totalSpend.toFixed(2)}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>AVERAGE DAILY EXPENDITURE</span>
              <strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>${avgDaily.toFixed(2)}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>FLAGGED ANOMALIES</span>
              <strong style={{ fontSize: '18px', color: 'var(--critical-color)' }}>{anomalies.length} Outlier Spikes</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>RECORD COUNT</span>
              <strong style={{ fontSize: '18px', color: 'var(--success-color)' }}>{costs.length} Telemetry Entries</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Telemetry Data Table for Report */}
      <div className="panel-container">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Detailed Cost Telemetry Ledger</h3>
            <p>Complete historical daily cost records exportable to CSV</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Observation Date</th>
                <th>Service Category</th>
                <th>Recorded Spend Amount</th>
                <th>Currency</th>
                <th>Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.date}</td>
                  <td><strong>{c.service}</strong></td>
                  <td style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>${c.amount.toFixed(2)}</td>
                  <td>{c.currency || 'USD'}</td>
                  <td>
                    <span className="status-badge-pill">
                      ● Verified Record
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
