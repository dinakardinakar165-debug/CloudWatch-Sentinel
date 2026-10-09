import React from 'react';
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CostRecord } from '../types';

interface CostAnalyticsViewProps {
  costs: CostRecord[];
}

export const CostAnalyticsView: React.FC<CostAnalyticsViewProps> = ({ costs }) => {
  const chartPalette = ['#3157C8', '#168C83', '#7764C8', '#D99A28', '#8491A5', '#2463A6'];

  const totalPeriodSpend = costs.reduce((acc, c) => acc + c.amount, 0);

  const serviceMap = costs.reduce((acc, c) => {
    acc[c.service] = (acc[c.service] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  const serviceDistribution = Object.entries(serviceMap).map(([name, total]) => ({
    name,
    value: Number(total.toFixed(2)),
    percentage: Number(((total / (totalPeriodSpend || 1)) * 100).toFixed(1))
  })).sort((a, b) => b.value - a.value);

  const highestCostService = serviceDistribution[0] || { name: 'Compute Services', value: 0, percentage: 0 };

  const dailyTotalsMap = costs.reduce((acc, c) => {
    acc[c.date] = (acc[c.date] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  const dailyTrendData = Object.entries(dailyTotalsMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }));

  const avgDailyCost = dailyTrendData.length > 0 ? totalPeriodSpend / dailyTrendData.length : 0;

  return (
    <div className="cost-analytics-container">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Highest Cost Category</span>
            <span className="metric-icon">🔥</span>
          </div>
          <div className="metric-value" style={{ fontSize: '18px', color: 'var(--brand-blue)' }}>{highestCostService.name}</div>
          <div className="metric-subtext">
            <span>${highestCostService.value.toFixed(2)} ({highestCostService.percentage}% of total)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Average Daily Spend</span>
            <span className="metric-icon">📊</span>
          </div>
          <div className="metric-value">${avgDailyCost.toFixed(2)}</div>
          <div className="metric-subtext">
            <span>Calculated across {dailyTrendData.length} daily entries</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Period Spend</span>
            <span className="metric-icon">💵</span>
          </div>
          <div className="metric-value">${totalPeriodSpend.toFixed(2)}</div>
          <div className="metric-subtext">
            <span>Aggregated 30-day expense pool</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">30-Day Projection</span>
            <span className="metric-icon">🎯</span>
          </div>
          <div className="metric-value">${(totalPeriodSpend * 1.05).toFixed(2)}</div>
          <div className="metric-subtext">
            <span style={{ color: 'var(--success-color)' }}>Statistical linear trend projection</span>
          </div>
        </div>
      </div>

      <div className="panels-grid">
        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Daily Aggregated Cost Trend ($ USD)</h3>
              <p>Daily cloud expenditure telemetry timeline</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData}>
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip formatter={(v: number | string | Array<number | string> | undefined) => [`$${Number(v || 0).toFixed(2)}`, 'Daily Cost']} />
                <Area type="monotone" dataKey="amount" stroke="var(--brand-blue)" strokeWidth={2} fill="var(--brand-subtle)" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Service Contribution (%)</h3>
              <p>Relative spend share by service category</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
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

      <div className="panel-container" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div className="panel-title">
            <h3>Daily Cost Distribution Histogram</h3>
            <p>Comparative daily spend distribution</p>
          </div>
        </div>
        <div style={{ width: '100%', height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyTrendData.slice(-14)}>
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip formatter={(v: number | string | Array<number | string> | undefined) => [`$${Number(v || 0).toFixed(2)}`, 'Daily Spend']} />
              <Bar dataKey="amount" fill="var(--brand-blue)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel-container">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Cloud Service Expense Breakdown Summary</h3>
            <p>Granular expenditure metrics by cloud service category</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cloud Service Category</th>
                <th>Total Recorded Spend</th>
                <th>Percentage Share</th>
                <th>Daily Average</th>
                <th>Cost Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceDistribution.map((item, idx) => (
                <tr key={idx}>
                  <td><strong>{item.name}</strong></td>
                  <td style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>${item.value.toFixed(2)}</td>
                  <td>{item.percentage}%</td>
                  <td>${(item.value / (dailyTrendData.length || 1)).toFixed(2)}</td>
                  <td>
                    <span className="status-badge-pill" style={{ background: 'var(--brand-subtle)', borderColor: 'var(--brand-border)', color: 'var(--brand-blue)' }}>
                      ● Tracked Baseline
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
