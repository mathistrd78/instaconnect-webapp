import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'contacts', icon: '👥', label: 'Contacts', path: '/app/contacts' },
    { id: 'calendar', icon: '📅', label: 'Calendrier', path: '/app/calendar' },
    { id: 'stats', icon: '📊', label: 'Statistiques', path: '/app/stats' },
    { id: 'tags', icon: '🏷️', label: 'Tags', path: '/app/tags' },
    { id: 'fields', icon: '📝', label: 'Champs', path: '/app/fields' },
    { id: 'profile', icon: '⚙️', label: 'Paramètres', path: '/app/profile' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">📱</div>
        <div className="logo-text">InstaConnect</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-label">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-version">v2.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
