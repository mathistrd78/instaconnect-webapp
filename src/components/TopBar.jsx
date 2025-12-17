import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import '../styles/TopBar.css';

const TopBar = () => {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="topbar">
      {/* Logo Title */}
      <div className="topbar-title">
        <span className="topbar-logo-icon">📱</span>
        <span className="topbar-logo-text">InstaConnect</span>
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        {/* Dark Mode Toggle */}
        <button
          className="topbar-btn"
          onClick={toggleDarkMode}
          title={darkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* User Menu */}
        <div className="topbar-user" ref={menuRef}>
          <button
            className="topbar-user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <span className="user-avatar">👤</span>
            <span className="user-name">{currentUser?.email?.split('@')[0]}</span>
            <span className="user-arrow">{showUserMenu ? '▲' : '▼'}</span>
          </button>

          {showUserMenu && (
            <div className="topbar-user-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-email">{currentUser?.email}</div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
