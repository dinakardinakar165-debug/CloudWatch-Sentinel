import React from 'react';
import { CostRecord } from '../types';

interface CloudResourcesViewProps {
  costs: CostRecord[];
}

export const CloudResourcesView: React.FC<CloudResourcesViewProps> = ({ costs }) => {
  const serviceTotals = costs.reduce((acc, c) => {
    acc[c.service] = (acc[c.service] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);

  const resourceCategories = [
    {
      id: 'compute',
      name: 'Compute Services',
      subtitle: 'EC2 Instances, Lambda Functions, App Runner',
      count: 14,
      cost: serviceTotals['Compute Services'] || 185.40,
      icon: '🖥️',
      status: 'Spike Observed'
    },
    {
      id: 'storage',
      name: 'Storage Services',
      subtitle: 'S3 Buckets, EBS Block Storage, EFS Volumes',
      count: 8,
      cost: serviceTotals['Storage Services'] || 24.30,
      icon: '🪣',
      status: 'Operational'
    },
    {
      id: 'database',
      name: 'Database Services',
      subtitle: 'DynamoDB Tables, RDS PostgreSQL Instances',
      count: 5,
      cost: serviceTotals['Database Services'] || 36.80,
      icon: '🗄️',
      status: 'Operational'
    },
    {
      id: 'network',
      name: 'Network & CDN',
      subtitle: 'CloudFront Distributions, VPC Gateways, Direct Connect',
      count: 6,
      cost: serviceTotals['Network & CDN'] || 14.50,
      icon: '🌐',
      status: 'Operational'
    },
    {
      id: 'api',
      name: 'API & Gateways',
      subtitle: 'API Gateway HTTP Routes, EventBridge Routers',
      count: 4,
      cost: serviceTotals['API & Gateways'] || 11.20,
      icon: '⚡',
      status: 'Operational'
    },
    {
      id: 'other',
      name: 'Other Cloud Services',
      subtitle: 'SNS Notifications, SQS Queues, CloudWatch Logs',
      count: 9,
      cost: serviceTotals['Other Cloud Services'] || 8.90,
      icon: '🔧',
      status: 'Operational'
    }
  ];

  return (
    <div className="resources-container">
      <div className="toast-banner" style={{ background: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning-color)' }}>
        <span>
          <strong>DEMO CLOUD ENVIRONMENT:</strong> Resource categories represent synthetic telemetry models for demonstration. The system architecture supports connecting real cloud provider billing APIs.
        </span>
      </div>

      <div className="metrics-grid">
        {resourceCategories.map(cat => (
          <div className="metric-card" key={cat.id}>
            <div className="metric-card-header">
              <span className="metric-card-title">{cat.name}</span>
              <span className="metric-icon">{cat.icon}</span>
            </div>
            <div className="metric-value">${cat.cost.toFixed(2)}</div>
            <div className="metric-subtext">
              <span>{cat.count} Active Resource Items</span>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-container">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Monitored Resource Infrastructure Categories</h3>
            <p>Monitored cloud service pools and estimated expense distribution</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Resource Architecture Examples</th>
                <th>Active Count</th>
                <th>Recorded Period Spend</th>
                <th>Infrastructure Status</th>
              </tr>
            </thead>
            <tbody>
              {resourceCategories.map(cat => (
                <tr key={cat.id}>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.subtitle}</td>
                  <td>{cat.count} Resources</td>
                  <td style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>${cat.cost.toFixed(2)}</td>
                  <td>
                    <span
                      className="status-badge-pill"
                      style={{
                        background: cat.status === 'Spike Observed' ? 'var(--critical-bg)' : 'var(--success-bg)',
                        borderColor: cat.status === 'Spike Observed' ? 'var(--critical-border)' : 'var(--success-border)',
                        color: cat.status === 'Spike Observed' ? 'var(--critical-color)' : 'var(--success-color)'
                      }}
                    >
                      ● {cat.status}
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
