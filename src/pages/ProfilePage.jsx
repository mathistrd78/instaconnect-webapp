import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { currentUser, logout } = useAuth();
  const { contacts, darkMode, toggleDarkMode } = useApp();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>⚙️ Profil</h2>
      </div>

      <div className="profile-content">
        {/* User Info */}
        <div className="profile-section">
          <div className="profile-section-title">Informations utilisateur</div>
          <div className="profile-info-card">
            <div className="profile-avatar">👤</div>
            <div className="profile-email">{currentUser?.email}</div>
          </div>
        </div>

        {/* Statistics */}
        <div className="profile-section">
          <div className="profile-section-title">Mes statistiques</div>
          <div className="profile-stats-grid">
            <div className="profile-stat-item">
              <div className="profile-stat-value">{contacts.length}</div>
              <div className="profile-stat-label">Contacts</div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="profile-section">
          <div className="profile-section-title">Paramètres</div>
          
          <div className="profile-setting-item">
            <div className="profile-setting-label">
              <span className="profile-setting-icon">🌙</span>
              <span>Mode sombre</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        {/* Logout Button */}
        <div className="profile-section">
          <button className="profile-logout-btn" onClick={handleLogout}>
            🚪 Déconnexion
          </button>
        </div>

        {/* App Info */}
        <div className="profile-footer">
          <div className="profile-app-name">InstaConnect</div>
          <div className="profile-app-version">Version 2.0.0</div>
          <div className="profile-app-description">
            Votre CRM Instagram professionnel
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
