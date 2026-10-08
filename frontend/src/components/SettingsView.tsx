import React from 'react';
import { TeamMember } from '../types';

export const SettingsView: React.FC = () => {
  const teamMembers: TeamMember[] = [
    { name: 'Dinakar S', rollNo: '24BCS405', role: 'Lead Software Architect & Full Stack Engineer' },
    { name: 'Kabileshwara Y', rollNo: '24BCS411', role: 'Senior Cloud Architect & Backend Engineer' },
    { name: 'Pranesh Sachin M', rollNo: '24BCS415', role: 'Senior DevOps & Security Engineer' },
    { name: 'Santhosh TMA', rollNo: '24BCS247', role: 'Data Analytics & QA Engineer' },
    { name: 'Nikhil R', rollNo: '24BCS190', role: 'UI/UX & Frontend Engineer' }
  ];

  return (
    <div className="settings-container">
      {/* Project Metadata Header Card */}
      <div className="panel-container" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div className="panel-title">
            <h3>CloudWatch Sentinel — Academic Project Profile</h3>
            <p>Cloud Application and Development • Kumaraguru College of Technology</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>PROJECT NAME</span>
            <strong style={{ fontSize: '15px', color: 'var(--accent-cyan)' }}>CloudWatch Sentinel</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>SUBJECT</span>
            <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>Cloud Application and Development</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>INSTITUTION</span>
            <strong style={{ fontSize: '15px', color: 'var(--accent-purple)' }}>Kumaraguru College of Technology (KCT)</strong>
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>CLOUD HOST</span>
            <strong style={{ fontSize: '15px', color: 'var(--accent-emerald)' }}>Render Free Cloud Platform</strong>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="panel-container" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div className="panel-title">
            <h3>Engineering Team Members (KCT CSE)</h3>
            <p>Project authors and technical contributors</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Project Engineering Role</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m, idx) => (
                <tr key={idx}>
                  <td><strong>{m.name}</strong></td>
                  <td><code style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{m.rollNo}</code></td>
                  <td>{m.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technology Stack & Transparency */}
      <div className="panels-grid">
        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>System Architecture & Stack</h3>
              <p>Technical specifications of the Sentinel platform</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <p><strong>Cloud Platform Target:</strong> Render Free Tier (Render Web Service + Render Static Site)</p>
            <p><strong>Frontend Stack:</strong> React 18, TypeScript 5, Vite 5, Recharts 2, Dark SaaS CSS</p>
            <p><strong>Backend API:</strong> Python 3.11+, FastAPI, Uvicorn ASGI Server</p>
            <p><strong>Database Engine:</strong> Auto-Initialized SQLite Repository (`sentinel.db` with WAL Journal Mode)</p>
            <p><strong>Authentication Protocol:</strong> HMAC-SHA256 JWT Token Verification with Salted Password Hashes</p>
            <p><strong>Anomaly Detection Engine:</strong> Population Z-Score Outlier Engine [ Z = (X - μ) / σ ]</p>

          </div>
        </div>

        <div className="panel-container">
          <div className="panel-header">
            <div className="panel-title">
              <h3>Data Source Disclosure</h3>
              <p>Transparency regarding cloud metrics provider</p>
            </div>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div className="toast-banner" style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.3)', color: 'var(--accent-amber)', marginBottom: 12 }}>
              <span>
                <strong>SIMULATED COST PROVIDER:</strong> The current deployment uses deterministic synthetic cloud cost data across 6 service categories for college demonstration purposes.
              </span>
            </div>
            <p>
              The application architecture separates data collection into a decoupled module. In production environments, this component can be configured to consume live provider APIs (such as AWS Cost Explorer API `ce:GetCostAndUsage`) without altering the anomaly detector or frontend UI layers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
