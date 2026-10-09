import React, { useState } from 'react';
import { CloudAccount } from '../types';

interface AccountsViewProps {
  account: CloudAccount;
  onSaveAccount: (name: string, roleArn: string, extId: string) => void;
  message: string | null;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  account,
  onSaveAccount,
  message
}) => {
  const [name, setName] = useState(account.accountName || 'Demo Cloud Account');
  const [roleArn, setRoleArn] = useState(account.roleArn || 'arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly');
  const [extId, setExtId] = useState(account.externalId || 'sentinel-demo-ext-12345');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAccount(name, roleArn, extId);
  };

  return (
    <div className="accounts-container">
      <div className="panels-grid">
        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Demo Cloud Account Credentials & IAM Role Configuration</h3>
              <p>Monitored cloud environment abstraction for security & identity isolation</p>
            </div>
          </div>

          {message && (
            <div className="toast-banner" style={{ marginBottom: 16 }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Cloud Account Display Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">IAM Role ARN Identifier</label>
              <input
                type="text"
                className="form-input"
                required
                value={roleArn}
                onChange={e => setRoleArn(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">External ID Token (Cross-Account Identity Validation)</label>
              <input
                type="text"
                className="form-input"
                required
                minLength={16}
                value={extId}
                onChange={e => setExtId(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifySelf: 'start' }}>
              Save Account Configuration
            </button>
          </form>
        </div>

        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Currently Monitored Account</h3>
              <p>Active account context</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>ACCOUNT NAME</span>
              <strong style={{ fontSize: '16px', color: 'var(--brand-blue)' }}>{account.accountName}</strong>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>ROLE ARN</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--text-primary)' }}>
                {account.roleArn}
              </code>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>EXTERNAL ID</span>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--brand-blue)' }}>
                {account.externalId}
              </code>
            </div>

            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>STATUS</span>
              <span className="status-badge-pill">
                ● Active Monitoring
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
