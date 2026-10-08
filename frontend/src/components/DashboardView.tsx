import React from 'react';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnomalyRecord, CostRecord } from '../types';

interface DashboardViewProps {
  costs: CostRecord[];
  anomalies: AnomalyRecord[];
  onTriggerSimulation: () => void;
  isSimulating: boolean;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  costs,
  anomalies,
  onTriggerSimulation,
  isSimulating,
  onNavigateTab
}) => {
  const latestPeriodSpend = costs.reduce((sum, item) => sum + item.amount, 0);
  const projectedMonthly = latestPeriodSpend * 1.08;
  const criticalCount = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  const serviceColors = ['#38bdf8', '#818cf8', '#fbbf24', '#f87171', '#34d399', '#c084fc'];

  const serviceDistribution = Object.entries(
    costs.reduce((acc, item) => {
      acc[item.service] = (acc[item.service] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  // Aggregate daily totals for clean area chart
  const dailyTotalsMap = costs.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailyTotalsMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, total]) => ({ date, amount: Number(total.toFixed(2)) }));

  return (
    <div className="dashboard-container">
      {/* Top Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Cloud Spend</span>
            <span className="metric-icon">💰</span>
          </div>
          <div className="metric-value">${latestPeriodSpend.toFixed(2)}</div>
          <div className="metric-subtext">
            <span>Recorded 30-day timeline total</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Monthly Forecast</span>
            <span className="metric-icon">📈</span>
          </div>
          <div className="metric-value">${projectedMonthly.toFixed(2)}</div>
          <div className="metric-subtext">
            <span style={{ color: 'var(--accent-emerald)' }}>+8.0% estimated baseline projection</span>
          </div>
        </div>

        <div className={`metric-card ${anomalies.length > 0 ? 'alert-warn' : ''}`}>
          <div className="metric-card-header">
            <span className="metric-card-title">Active Anomalies</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-value">{anomalies.length}</div>
          <div className="metric-subtext">
            <span style={{ color: anomalies.length > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
              Statistical Z-Score ≥ 2.0 Outliers
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Cloud Resource Pool</span>
            <span className="metric-icon">☁️</span>
          </div>
          <div className="metric-value">6 Categories</div>
          <div className="metric-subtext">
            <span>Compute, Storage, DB, Network, API, Other</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Critical Alerts</span>
            <span className="metric-icon">🚨</span>
          </div>
          <div className="metric-value" style={{ color: criticalCount > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
            {criticalCount}
          </div>
          <div className="metric-subtext">
            <span>High/Critical severity triggers</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Monitoring Status</span>
            <span className="metric-icon">🟢</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)', fontSize: '20px' }}>
            ● Active
          </div>
          <div className="metric-subtext">
            <span>Render Web Service Engine</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="panels-grid">
        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Daily Aggregated Spend Trend ($ USD)</h3>
              <p>Simulated multi-service cloud daily expense telemetry</p>
            </div>
            <button
              className="btn-trigger-simulation"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
              onClick={onTriggerSimulation}
              disabled={isSimulating}
            >
              ⚡ Simulate Cost Spike
            </button>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="var(--text-dim)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-dim)" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: number | string | Array<number | string> | undefined) => [`$${Number(value || 0).toFixed(2)}`, 'Total Spend']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--accent-cyan)"
                  strokeWidth={3}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Service Spend Distribution</h3>
              <p>Expense breakdown across 6 categories</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {serviceDistribution.map((_, idx) => (
                    <Cell key={idx} fill={serviceColors[idx % serviceColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number | string | Array<number | string> | undefined) => [`$${Number(val || 0).toFixed(2)}`, 'Spend']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Anomalies Overview Table */}
      <div className="panel-container">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Recent Cost Anomalies (Z-Score ≥ 2.0)</h3>
            <p>Outlier spending spikes flagged by statistical deviation engine</p>
          </div>
          <button
            className="btn-primary"
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
            onClick={() => onNavigateTab('Anomalies')}
          >
            View All Anomalies →
          </button>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cloud Service</th>
                <th>Recorded Spend</th>
                <th>Expected Baseline</th>
                <th>Calculated Z-Score</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No cost anomalies currently recorded. Click "Simulate Cost Event" to inject a spend spike.
                  </td>
                </tr>
              ) : (
                anomalies.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.service}</strong></td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 700 }}>
                      ${row.amount.toFixed(2)}
                    </td>
                    <td>${(row.baseline || 50.0).toFixed(2)}</td>
                    <td>{row.zScore ? row.zScore.toFixed(2) : '3.50'}</td>
                    <td>
                      <span className={`severity-badge severity-${row.severity}`}>
                        {row.severity.toUpperCase()}
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
