import React from 'react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  userEmail: string | null;
  jwtAuthenticated: boolean;
  onSignOut: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userEmail,
  jwtAuthenticated,
  onSignOut,
  isOpenMobile,
  onCloseMobile,
  alertCount
}) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'Dashboard', label: 'Dashboard', icon: '📊' }
      ]
    },
    {
      title: 'MONITORING',
      items: [
        { id: 'Cost Analytics', label: 'Cost Analytics', icon: '📈' },
        { id: 'Anomalies', label: 'Anomalies Engine', icon: '⚡' },
        { id: 'Alerts & Notifications', label: 'Alerts & Notifications', icon: '🔔', badge: alertCount > 0 ? alertCount : undefined },
        { id: 'Cloud Resources', label: 'Cloud Resources', icon: '☁️' }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { id: 'Demo Cloud Account', label: 'Accounts & Roles', icon: '🔑' },
        { id: 'Settings', label: 'Settings & Team', icon: '⚙️' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'System Health', label: 'System Health', icon: '🟢' }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpenMobile ? 'open' : ''}`}>
      <div className="brand-header">
        <div className="brand-logo-icon">CS</div>
        <div className="brand-text">
          <h1>CloudWatch Sentinel</h1>
          <small>Cloud Cost Intelligence</small>
        </div>
      </div>

      <div className="kct-badge">
        <strong>KCT Project</strong> • 24BCS405 Team
      </div>

      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.title}>
            <div className="nav-group-title">{section.title}</div>
            <div className="nav-items">
              {section.items.map(item => (
                <button
                  key={item.id}
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="nav-badge-pill">{item.badge}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-info-row">
          <div className="user-avatar">
            {userEmail ? userEmail.charAt(0).toUpperCase() : 'D'}
          </div>
          <div className="user-details">
            <p>{userEmail || 'Demo Student User'}</p>
            <small>{jwtAuthenticated ? '● JWT Auth Session' : '● Demo Local Access'}</small>
          </div>
        </div>
        {jwtAuthenticated ? (
          <button className="btn-signout" onClick={onSignOut}>
            Sign Out Session
          </button>
        ) : (
          <button
            className="btn-signout"
            style={{ color: 'var(--accent-cyan)', borderColor: 'rgba(56,189,248,0.3)', background: 'rgba(56,189,248,0.1)' }}
            onClick={() => onSelectTab('Login')}
          >
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
};
