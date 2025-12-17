import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BottomNav.css';

const BottomNav = ({ currentSection }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'contacts', icon: '👥', label: 'Contacts', path: '/app/contacts' },
    { id: 'stats', icon: '📊', label: 'Stats', path: '/app/stats' },
    { id: 'profile', icon: '⚙️', label: 'Profil', path: '/app/profile' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map(item => (
        <div
          key={item.id}
          className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <div className="nav-item-icon">{item.icon}</div>
          <div className="nav-item-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default BottomNav;
