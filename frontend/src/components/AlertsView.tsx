import React, { useState } from 'react';
import { NotificationRecord } from '../types';

interface AlertsViewProps {
  notifications: NotificationRecord[];
  onTriggerSimulation: () => void;
  isSimulating: boolean;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  notifications,
  onTriggerSimulation,
  isSimulating
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const handleMarkAsRead = (id: string) => {
    setReadIds(prev => new Set(prev).add(id));
  };

  const handleMarkAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.notificationId)));
  };

  const filtered = notifications.filter(n => {
    if (filterSeverity === 'all') return true;
    return n.severity.toLowerCase() === filterSeverity.toLowerCase();
  });

  const criticalCount = notifications.filter(n => n.severity.toLowerCase() === 'critical').length;
  const unreadCount = notifications.filter(n => !readIds.has(n.notificationId) && !n.read).length;

  return (
    <div className="alerts-container">
      <div className="metrics-grid">
        <div className="metric-card alert-warn">
          <div className="metric-card-header">
            <span className="metric-card-title">Active Notifications</span>
            <span className="metric-icon">🔔</span>
          </div>
          <div className="metric-value">{notifications.length}</div>
          <div className="metric-subtext">
            <span>In-App & Backend Event Alerts</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Critical Alerts</span>
            <span className="metric-icon">🚨</span>
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-rose)' }}>{criticalCount}</div>
          <div className="metric-subtext">
            <span>Immediate Cost Investigation Required</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Unread Status</span>
            <span className="metric-icon">📩</span>
          </div>
          <div className="metric-value" style={{ color: unreadCount > 0 ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
            {unreadCount}
          </div>
          <div className="metric-subtext">
            <span>Pending Analyst Review</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Notification Channel</span>
            <span className="metric-icon">📢</span>
          </div>
          <div className="metric-value" style={{ fontSize: '18px', color: 'var(--accent-cyan)' }}>
            In-App & Stdout Log
          </div>
          <div className="metric-subtext">
            <span>SQLite Table & Python Logger</span>
          </div>
        </div>
      </div>

      <div className="panel-container">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
          <div className="panel-title">
            <h3>Anomaly Notification & Alert Log</h3>
            <p>Automated alerts published when Z-score anomaly detector flags spending spikes</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              className="form-select"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              value={filterSeverity}
              onChange={e => setFilterSeverity(e.target.value)}
            >
              <option value="all">All Alerts</option>
              <option value="critical">Critical Severity</option>
              <option value="high">High Severity</option>
            </select>

            <button
              className="form-input"
              style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', background: 'var(--panel-bg-hover)' }}
              onClick={handleMarkAllRead}
            >
              ✓ Mark All Read
            </button>

            <button
              className="btn-trigger-simulation"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={onTriggerSimulation}
              disabled={isSimulating}
            >
              ⚡ Simulate Cost Spike Event
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No notifications logged matching criteria. Click "Simulate Cost Spike Event" to trigger an alert.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map((item, idx) => {
              const isRead = readIds.has(item.notificationId) || Boolean(item.read);
              const sev = item.severity.toLowerCase();

              return (
                <div key={idx} className={`alert-card-item ${sev}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`severity-badge severity-${sev}`}>
                        {sev.toUpperCase()}
                      </span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        {item.title}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <small style={{ color: 'var(--text-dim)', fontSize: '11px' }}>
                        {item.createdAt ? item.createdAt.substring(0, 16).replace('T', ' ') : 'Just Now'}
                      </small>
                      {!isRead && (
                        <button
                          style={{
                            padding: '3px 8px',
                            fontSize: '11px',
                            background: 'rgba(56,189,248,0.1)',
                            border: '1px solid rgba(56,189,248,0.3)',
                            color: 'var(--accent-cyan)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => handleMarkAsRead(item.notificationId)}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {item.message}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
