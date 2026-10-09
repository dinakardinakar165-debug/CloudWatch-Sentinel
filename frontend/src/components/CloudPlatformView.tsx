import React, { useState } from 'react';

interface CloudPlatformViewProps {
  onNavigateTab: (tab: string) => void;
}

export const CloudPlatformView: React.FC<CloudPlatformViewProps> = ({ onNavigateTab }) => {
  const renderFrontendUrl = 'https://cloudwatch-sentinel-ui.onrender.com';
  const renderBackendUrl = 'https://cloudwatch-sentinel-api.onrender.com';
  const renderHealthUrl = 'https://cloudwatch-sentinel-api.onrender.com/health';

  const [liveStatus, setLiveStatus] = useState<'UNTESTED' | 'CHECKING' | 'LIVE' | 'SUSPENDED'>('UNTESTED');
  const [liveLatency, setLiveLatency] = useState<number | null>(null);
  const [statusDetail, setStatusDetail] = useState<string>('Click button below to verify public Render cloud availability.');

  const testLiveRenderHealth = async () => {
    setLiveStatus('CHECKING');
    setStatusDetail('Sending asynchronous HTTPS ping to public Render Web Service...');
    const start = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(renderHealthUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      const end = performance.now();
      const latency = Math.round(end - start);

      if (res.ok) {
        setLiveStatus('LIVE');
        setLiveLatency(latency);
        setStatusDetail(`HTTP 200 OK — Render Web Service is active and responding (${latency} ms).`);
      } else {
        setLiveStatus('SUSPENDED');
        setStatusDetail(`HTTP ${res.status} — Service is suspended or sleeping on Render Free Tier.`);
      }
    } catch {
      setLiveStatus('SUSPENDED');
      setStatusDetail('SUSPENDED OR UNAVAILABLE — Render Free Tier service is currently sleeping/suspended. Click Retry on Render Dashboard to resume.');
    }
  };

  return (
    <div className="cloud-platform-container">
      {/* Top Banner Notice */}
      <div className="toast-banner" style={{ background: 'rgba(56,189,248,0.1)', borderColor: 'rgba(56,189,248,0.3)', color: 'var(--accent-cyan)', marginBottom: 20 }}>
        <span>
          <strong>OFFICIAL CLOUD HOSTING PLATFORM:</strong> Render Cloud Platform (Render Web Service + Render Static Site). This page details public cloud architecture, environment separation, and live cloud endpoint status.
        </span>
      </div>

      {/* Cloud Architecture Flowchart Panel */}
      <div className="panel-container" style={{ marginBottom: 20 }}>
        <div className="panel-header">
          <div className="panel-title">
            <h3>Cloud Application Architecture & Component Topology</h3>
            <p>Decoupled multi-tier cloud service distribution model on Render</p>
          </div>
        </div>

        <div style={{ background: '#090d16', border: '1px solid var(--panel-border)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, textAlign: 'center' }}>
            <div style={{ padding: 14, background: 'var(--panel-bg)', borderRadius: 8, border: '1px solid var(--panel-border)' }}>
              <span style={{ fontSize: 22 }}>🌐</span>
              <strong style={{ display: 'block', fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>Client Web Browser</strong>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>Public User Interface</small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-cyan)', fontSize: 16 }}>
              ➔ HTTPS ➔
            </div>

            <div style={{ padding: 14, background: 'var(--panel-bg)', borderRadius: 8, border: '1px solid rgba(56,189,248,0.3)' }}>
              <span style={{ fontSize: 22 }}>⚛️</span>
              <strong style={{ display: 'block', fontSize: 13, color: 'var(--accent-cyan)', marginTop: 4 }}>Render Static Site</strong>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>React 18 + Vite CDN</small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-purple)', fontSize: 16 }}>
              ➔ REST API ➔
            </div>

            <div style={{ padding: 14, background: 'var(--panel-bg)', borderRadius: 8, border: '1px solid rgba(129,140,248,0.3)' }}>
              <span style={{ fontSize: 22 }}>⚡</span>
              <strong style={{ display: 'block', fontSize: 13, color: 'var(--accent-purple)', marginTop: 4 }}>Render Web Service</strong>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>Python FastAPI Engine</small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)', fontSize: 16 }}>
              ➔ SQL ➔
            </div>

            <div style={{ padding: 14, background: 'var(--panel-bg)', borderRadius: 8, border: '1px solid rgba(52,211,153,0.3)' }}>
              <span style={{ fontSize: 22 }}>💾</span>
              <strong style={{ display: 'block', fontSize: 13, color: 'var(--accent-emerald)', marginTop: 4 }}>SQLite Repository</strong>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>sentinel.db (WAL Mode)</small>
            </div>
          </div>
        </div>
      </div>

      {/* Live Render Status Panel */}
      <div className="panel-container" style={{ marginBottom: 20 }}>
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="panel-title">
            <h3>Live Render Cloud Endpoint Status Monitor</h3>
            <p>Verification of public cloud deployment URLs and API health</p>
          </div>

          <button
            className="btn-trigger-simulation"
            style={{ padding: '6px 14px', fontSize: '12px' }}
            onClick={testLiveRenderHealth}
            disabled={liveStatus === 'CHECKING'}
          >
            {liveStatus === 'CHECKING' ? '⏳ Testing HTTPS Ping...' : '🔄 Test Live Render Health Endpoint'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Frontend Static Site</span>
              <span className="metric-icon">🌐</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', margin: '8px 0' }}>
              {renderFrontendUrl}
            </div>
            <div className="metric-subtext">
              <span>Hosted on Render Global CDN</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Backend API Web Service</span>
              <span className="metric-icon">⚡</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--accent-purple)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', margin: '8px 0' }}>
              {renderBackendUrl}
            </div>
            <div className="metric-subtext">
              <span>FastAPI ASGI Container Service</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Verified Cloud Status</span>
              <span className="metric-icon">📡</span>
            </div>
            <div className="metric-value" style={{
              fontSize: '18px',
              color: liveStatus === 'LIVE' ? 'var(--success-color)' : liveStatus === 'SUSPENDED' ? 'var(--critical-color)' : 'var(--warning-color)'
            }}>
              {liveStatus === 'LIVE' && `● VERIFIED LIVE (${liveLatency ?? 0} ms)`}
              {liveStatus === 'SUSPENDED' && '⚠️ SUSPENDED OR UNAVAILABLE'}
              {liveStatus === 'UNTESTED' && '● UNTESTED (Click Test)'}
              {liveStatus === 'CHECKING' && '⏳ PINGING...'}
            </div>
            <div className="metric-subtext">
              <span>{statusDetail}</span>
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <a
            href={renderFrontendUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
            style={{ textDecoration: 'none', fontSize: 12, padding: '7px 14px' }}
          >
            ↗ Open Render Frontend Site
          </a>

          <a
            href={renderHealthUrl}
            target="_blank"
            rel="noreferrer"
            className="form-input"
            style={{ textDecoration: 'none', fontSize: 12, padding: '7px 14px', background: 'var(--bg-subtle)' }}
          >
            ↗ Open Backend /health Endpoint
          </a>

          <button
            className="form-input"
            style={{ fontSize: 12, padding: '7px 14px', background: 'var(--bg-subtle)', cursor: 'pointer' }}
            onClick={() => onNavigateTab('Dashboard')}
          >
            ← Return to Dashboard Overview
          </button>
        </div>

      </div>

      {/* Local vs Cloud Environment Comparison Table */}
      <div className="panel-container">
        <div className="panel-header">
          <div className="panel-title">
            <h3>Environment Separation & Execution Comparison</h3>
            <p>Clear distinction between local evaluation and public Render cloud deployment</p>
          </div>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Environment Attribute</th>
                <th>Local Development Environment</th>
                <th>Render Public Cloud Platform</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Frontend URL</strong></td>
                <td><code style={{ color: 'var(--accent-cyan)' }}>http://localhost:5173</code></td>
                <td><code style={{ color: 'var(--accent-cyan)' }}>https://cloudwatch-sentinel-ui.onrender.com</code></td>
              </tr>
              <tr>
                <td><strong>Backend REST API</strong></td>
                <td><code style={{ color: 'var(--accent-purple)' }}>http://127.0.0.1:8000</code></td>
                <td><code style={{ color: 'var(--accent-purple)' }}>https://cloudwatch-sentinel-api.onrender.com</code></td>
              </tr>
              <tr>
                <td><strong>Hosting Provider</strong></td>
                <td>Local Development Machine</td>
                <td>Render Free Tier (Oregon Region)</td>
              </tr>
              <tr>
                <td><strong>Deployment Trigger</strong></td>
                <td>Manual (`npm run dev` / `uvicorn`)</td>
                <td>Automatic 1-Click Blueprint from GitHub `main`</td>
              </tr>
              <tr>
                <td><strong>GitHub Commit Source</strong></td>
                <td>`a654696` (`main` branch)</td>
                <td>`a654696` (`main` branch)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
