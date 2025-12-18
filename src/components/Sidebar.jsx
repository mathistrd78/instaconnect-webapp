import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
  { id: 'contacts', label: 'Contacts', icon: '👥', path: '/app/contacts' },
  { id: 'calendar', label: 'Calendrier', icon: '📅', path: '/app/calendrier' },
  { id: 'stats', label: 'Statistiques', icon: '📊', path: '/app/statistiques' },
  { id: 'unfollowers', label: 'Unfollowers', icon: '💔', path: '/app/unfollowers' },
  { id: 'settings', label: 'Profil', icon: '👤', path: '/app/parametres' }
];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map(item => (
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

      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </div>
  );
};

export default Sidebar;
