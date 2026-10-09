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
  const avgDailySpend = costs.length > 0 ? latestPeriodSpend / new Set(costs.map(c => c.date)).size : 0;
  const criticalCount = anomalies.filter(a => a.severity === 'critical' || a.severity === 'high').length;

  const chartPalette = ['#3157C8', '#168C83', '#7764C8', '#D99A28', '#8491A5', '#2463A6'];

  const serviceDistribution = Object.entries(
    costs.reduce((acc, item) => {
      acc[item.service] = (acc[item.service] || 0) + item.amount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }));

  const dailyTotalsMap = costs.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailyTotalsMap)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .map(([date, total]) => ({ date, amount: Number(total.toFixed(2)) }));

  return (
    <div className="dashboard-container">
      {/* Guided Presentation Walkthrough Panel */}
      <div className="math-explainer-card" style={{ marginBottom: 20, background: 'var(--bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brand-blue)', marginBottom: 4 }}>
              🎓 College Review Presentation Walkthrough (KCT 24BCS405 Team)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Follow this 1-click presentation routine during your viva demonstration:
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ fontSize: 11.5, padding: '6px 12px' }}
            onClick={() => onNavigateTab('Cloud Platform & Deployment')}
          >
            🚀 View Render Cloud Architecture
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Dashboard')}>
            1. Overview
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Cost Analytics')}>
            2. Cost Analytics
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Cloud Resources')}>
            3. Cloud Resources
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Anomalies')}>
            4. Z-Score Anomalies
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Alerts & Notifications')}>
            5. In-App Alerts
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Cloud Platform & Deployment')}>
            6. Render Cloud Host
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('System Health')}>
            7. System Health
          </button>
          <button className="btn-primary" style={{ padding: '5px 10px', fontSize: 11.5, background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }} onClick={() => onNavigateTab('Settings')}>
            8. KCT Team Roster
          </button>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Spend</span>
            <span className="metric-icon">💵</span>
          </div>
          <div className="metric-value">${latestPeriodSpend.toFixed(2)}</div>
          <div className="metric-subtext">
            <span>Aggregated 30-day telemetry pool</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Average Daily Spend</span>
            <span className="metric-icon">📊</span>
          </div>
          <div className="metric-value">${avgDailySpend.toFixed(2)}</div>
          <div className="metric-subtext">
            <span>Calculated per daily timeframe</span>
          </div>
        </div>

        <div className={`metric-card ${anomalies.length > 0 ? 'alert-warn' : ''}`}>
          <div className="metric-card-header">
            <span className="metric-card-title">Active Anomalies</span>
            <span className="metric-icon">⚡</span>
          </div>
          <div className="metric-value">{anomalies.length}</div>
          <div className="metric-subtext">
            <span style={{ color: anomalies.length > 0 ? 'var(--critical-color)' : 'var(--text-secondary)' }}>
              Statistical Z-Score ≥ 2.0 Outliers
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Critical Alerts</span>
            <span className="metric-icon">🔔</span>
          </div>
          <div className="metric-value" style={{ color: criticalCount > 0 ? 'var(--critical-color)' : 'var(--success-color)' }}>
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
          <div className="metric-value" style={{ color: 'var(--success-color)', fontSize: '20px' }}>
            ● Operational
          </div>
          <div className="metric-subtext">
            <span>FastAPI Web Engine Active</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="panels-grid">
        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Daily Aggregated Cost Trend ($ USD)</h3>
              <p>Simulated multi-service daily cloud expenditure timeline</p>
            </div>
            <button
              className="btn-trigger-simulation"
              style={{ fontSize: '11.5px', padding: '5px 10px' }}
              onClick={onTriggerSimulation}
              disabled={isSimulating}
            >
              ⚡ Simulate Cost Event
            </button>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <Tooltip formatter={(val: number | string | Array<number | string> | undefined) => [`$${Number(val || 0).toFixed(2)}`, 'Spend']} />
                <Area type="monotone" dataKey="amount" stroke="var(--brand-blue)" strokeWidth={2} fill="var(--brand-subtle)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Spend Distribution by Service</h3>
              <p>Breakdown across 6 service categories</p>
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
                  paddingAngle={2}
                >
                  {serviceDistribution.map((_, idx) => (
                    <Cell key={idx} fill={chartPalette[idx % chartPalette.length]} />
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
            <p>Cost spikes identified by statistical population standard deviation engine</p>
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
                <th>Z-Score</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No cost anomalies recorded. Click "Simulate Cost Event" to inject a spend spike.
                  </td>
                </tr>
              ) : (
                anomalies.slice(0, 5).map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td><strong>{row.service}</strong></td>
                    <td style={{ color: 'var(--critical-color)', fontWeight: 700 }}>
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
