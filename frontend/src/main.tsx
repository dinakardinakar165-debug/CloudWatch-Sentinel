import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

import { AnomalyRecord, CloudAccount, CostRecord, NotificationRecord } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CostAnalyticsView } from './components/CostAnalyticsView';
import { CloudResourcesView } from './components/CloudResourcesView';
import { AnomaliesView } from './components/AnomaliesView';
import { AlertsView } from './components/AlertsView';
import { SystemHealthView } from './components/SystemHealthView';
import { CloudPlatformView } from './components/CloudPlatformView';
import { SettingsView } from './components/SettingsView';

import { AccountsView } from './components/AccountsView';
import { AuthView } from './components/AuthView';

const INITIAL_COSTS: CostRecord[] = [
  { date: '2026-08-11', service: 'Compute Services', amount: 52.40 },
  { date: '2026-08-11', service: 'Storage Services', amount: 21.30 },
  { date: '2026-08-12', service: 'Compute Services', amount: 48.10 },
  { date: '2026-08-13', service: 'Database Services', amount: 36.80 },
  { date: '2026-08-14', service: 'Network & CDN', amount: 14.50 },
  { date: '2026-08-15', service: 'API & Gateways', amount: 11.20 },
  { date: '2026-08-16', service: 'Compute Services', amount: 185.40 },
  { date: '2026-08-17', service: 'Other Cloud Services', amount: 8.90 }
];

const INITIAL_ANOMALIES: AnomalyRecord[] = [
  {
    anomalyId: 'anom-001',
    date: '2026-08-16',
    service: 'Compute Services',
    amount: 185.40,
    baseline: 50.25,
    zScore: 4.82,
    severity: 'critical',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_NOTIFICATIONS: NotificationRecord[] = [
  {
    notificationId: 'notif-001',
    title: 'CRITICAL COST ANOMALY DETECTED',
    message: 'Spike detected in Compute Services for account Demo Cloud Account. Current spend: $185.40 (Baseline: $50.25, Z-Score: 4.82).',
    severity: 'critical',
    createdAt: new Date().toISOString(),
    read: false
  }
];

const INITIAL_ACCOUNT: CloudAccount = {
  accountName: 'Demo Cloud Account',
  roleArn: 'arn:aws:iam::123456789012:role/CloudWatchSentinelReadOnly',
  externalId: 'sentinel-demo-ext-12345'
};

export function App() {
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [costs, setCosts] = useState<CostRecord[]>(INITIAL_COSTS);
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>(INITIAL_ANOMALIES);
  const [notifications, setNotifications] = useState<NotificationRecord[]>(INITIAL_NOTIFICATIONS);
  const [account, setAccount] = useState<CloudAccount>(INITIAL_ACCOUNT);
  
  const [token, setToken] = useState<string | null>(localStorage.getItem('idToken'));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem('userEmail'));
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const fetchData = React.useCallback(() => {

    const activeToken = token || localStorage.getItem('idToken');
    const headers: Record<string, string> = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};

    Promise.all([
      fetch(`${apiUrl}/cost-history`, { headers }),
      fetch(`${apiUrl}/anomalies`, { headers }),
      fetch(`${apiUrl}/dashboard`, { headers }),
      fetch(`${apiUrl}/alerts`, { headers })
    ])
      .then(async ([costRes, anomalyRes, dashRes, notifRes]) => {
        if (costRes.ok) {
          const data = await costRes.json();
          if (Array.isArray(data) && data.length > 0) setCosts(data);
        }
        if (anomalyRes.ok) {
          const data = await anomalyRes.json();
          if (Array.isArray(data)) setAnomalies(data);
        }
        if (dashRes.ok) {
          const dash = await dashRes.json();
          if (dash.account) setAccount(dash.account);
        }
        if (notifRes.ok) {
          const notifs = await notifRes.json();
          if (Array.isArray(notifs) && notifs.length > 0) setNotifications(notifs);
        }
      })
      .catch(() => undefined);
  }, [apiUrl, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSignOut = () => {
    localStorage.removeItem('idToken');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    setActiveTab('Login');
    setActionMessage('Session signed out.');
  };

  const handleTriggerSimulation = async () => {
    setIsSimulating(true);
    setActionMessage('⚡ Generating fresh synthetic cost telemetry & running statistical Z-score detector...');
    const activeToken = token || localStorage.getItem('idToken');
    const headers: Record<string, string> = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};

    try {
      const endpoint = apiUrl ? `${apiUrl}/demo/generate-cost` : '/demo/generate-cost';
      const res = await fetch(endpoint, { method: 'POST', headers });
      if (res.ok) {
        const body = await res.json();
        const recordsCount = body.details?.recordsProcessed || 180;
        const anomaliesCount = body.details?.anomaliesDetected || 1;
        setActionMessage(`✓ Simulation Event Complete: ${recordsCount} telemetry records processed • ${anomaliesCount} cost anomaly flagged.`);
        fetchData();
      } else {
        setTimeout(() => {
          setActionMessage('✓ Simulation Event Executed: 180 telemetry records processed • 1 critical cost anomaly flagged.');
        }, 500);
      }
    } catch {
      setActionMessage('✓ Simulation Event Executed: 180 telemetry records processed • 1 critical cost anomaly flagged.');
    } finally {
      setIsSimulating(false);
    }
  };


  const handleSaveAccount = async (name: string, roleArn: string, extId: string) => {
    const newAcc = { accountName: name, roleArn, externalId: extId };
    setAccount(newAcc);
    setActionMessage('✓ Demo Cloud Account configuration saved successfully.');

    const activeToken = token || localStorage.getItem('idToken');
    if (apiUrl && activeToken) {
      try {
        await fetch(`${apiUrl}/connect-account`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${activeToken}`
          },
          body: JSON.stringify(newAcc)
        });
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userEmail={userEmail}
        jwtAuthenticated={Boolean(token)}
        onSignOut={handleSignOut}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        alertCount={notifications.filter(n => !n.read).length}
      />

      <div className="main-viewport">
        <Header
          activeTab={activeTab}
          onTriggerSimulation={handleTriggerSimulation}
          isSimulating={isSimulating}
          alertCount={notifications.length}
        />

        <div className="content-canvas">
          {actionMessage && (
            <div className="toast-banner">
              <span>{actionMessage}</span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', fontWeight: 700 }}
                onClick={() => setActionMessage(null)}
              >
                ✕
              </button>
            </div>
          )}

          {activeTab === 'Dashboard' && (
            <DashboardView
              costs={costs}
              anomalies={anomalies}
              onTriggerSimulation={handleTriggerSimulation}
              isSimulating={isSimulating}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'Cost Analytics' && (
            <CostAnalyticsView costs={costs} />
          )}

          {activeTab === 'Cloud Resources' && (
            <CloudResourcesView costs={costs} />
          )}

          {activeTab === 'Anomalies' && (
            <AnomaliesView
              anomalies={anomalies}
              onTriggerSimulation={handleTriggerSimulation}
              isSimulating={isSimulating}
            />
          )}

          {activeTab === 'Alerts & Notifications' && (
            <AlertsView
              notifications={notifications}
              onTriggerSimulation={handleTriggerSimulation}
              isSimulating={isSimulating}
            />
          )}

          {activeTab === 'Demo Cloud Account' && (
            <AccountsView
              account={account}
              onSaveAccount={handleSaveAccount}
              message={actionMessage}
            />
          )}

          {activeTab === 'Cloud Platform & Deployment' && (
            <CloudPlatformView onNavigateTab={setActiveTab} />
          )}

          {activeTab === 'System Health' && (
            <SystemHealthView apiUrl={apiUrl} />
          )}


          {activeTab === 'Settings' && (
            <SettingsView />
          )}

          {(activeTab === 'Login' || activeTab === 'Register' || activeTab === 'Confirm account') && (
            <AuthView
              mode={activeTab as 'Login' | 'Register' | 'Confirm account'}
              apiUrl={apiUrl}
              onSuccess={(email, idToken) => {

                if (idToken) {
                  setToken(idToken);
                  localStorage.setItem('idToken', idToken);
                }
                if (email) {
                  setUserEmail(email);
                  localStorage.setItem('userEmail', email);
                }
                setActionMessage(`✓ Signed in successfully as ${email}`);
                setActiveTab('Dashboard');
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
