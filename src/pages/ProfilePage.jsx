import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Profile.css';

const ProfilePage = () => {
  const { darkMode, toggleDarkMode, contacts } = useApp();
  const { currentUser } = useAuth();

  const stats = {
    totalContacts: contacts.length,
    createdDate: currentUser?.metadata?.creationTime 
      ? new Date(currentUser.metadata.creationTime).toLocaleDateString('fr-FR')
      : 'N/A'
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>⚙️ Paramètres</h1>
      </div>

      <div className="profile-content">
        {/* User Info */}
        <div className="profile-section">
          <h2>👤 Informations du compte</h2>
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{currentUser?.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Compte créé le</span>
              <span className="info-value">{stats.createdDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total contacts</span>
              <span className="info-value">{stats.totalContacts}</span>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="profile-section">
          <h2>🎨 Apparence</h2>
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Mode sombre</div>
              <div className="setting-description">
                {darkMode ? 'Activé' : 'Désactivé'}
              </div>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={darkMode}
                onChange={toggleDarkMode}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* About */}
        <div className="profile-section">
          <h2>ℹ️ À propos</h2>
          <div className="about-info">
            <p><strong>InstaConnect</strong> v2.0.0</p>
            <p>Votre CRM Instagram professionnel</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
