import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import '../styles/Profile.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { contacts, darkMode, toggleDarkMode } = useApp();

  // Get Instagram stats from contacts
  const instagramStats = {
    followers: 0,
    following: 0,
    unfollowers: 0,
    fans: 0,
    pendingRequests: 0
  };

  const totalContacts = contacts.length;

  // Format date
  const accountCreationDate = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Date inconnue';

  const handleDeleteAccount = async () => {
    if (window.confirm('⚠️ ATTENTION : Cette action est irréversible. Toutes vos données seront définitivement supprimées. Êtes-vous absolument sûr(e) ?')) {
      try {
        alert('Fonctionnalité de suppression de compte à venir');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Erreur lors de la suppression du compte');
      }
    }
  };

  console.log('ProfilePage rendering'); // Debug

  return (
    <div className="profile-page" style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="profile-header">
        <h1>⚙️ Paramètres</h1>
        <p className="profile-subtitle">
          Gérez votre compte et vos préférences
        </p>
      </div>

      {/* Account Information */}
      <section className="profile-section">
        <h2 className="section-title">Informations du compte</h2>
        
        <div className="account-info">
          <div className="info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{currentUser?.email || 'Non disponible'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Membre depuis</span>
            <span className="info-value">{accountCreationDate}</span>
          </div>
        </div>

        {/* Stats Cards - Row 1 */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-value">{totalContacts}</div>
            <div className="stat-label">Contacts</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{instagramStats.followers}</div>
            <div className="stat-label">Followers</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{instagramStats.following}</div>
            <div className="stat-label">Following</div>
          </div>
        </div>

        {/* Stats Cards - Row 2 */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="stat-value">{instagramStats.unfollowers}</div>
            <div className="stat-label">Unfollowers</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{instagramStats.fans}</div>
            <div className="stat-label">Fans</div>
          </div>
          <div className="profile-stat-card">
            <div className="stat-value">{instagramStats.pendingRequests}</div>
            <div className="stat-label">Demandes en attente</div>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="profile-section">
        <h2 className="section-title">Apparence</h2>
        
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
      </section>

      {/* Fields Management */}
      <section className="profile-section">
        <div 
          className="setting-item clickable"
          onClick={() => navigate('/app/champs')}
        >
          <div className="setting-info">
            <div className="setting-label">Gestion des champs</div>
            <div className="setting-description">
              Personnalisez les champs de vos contacts
            </div>
          </div>
          <span className="arrow">→</span>
        </div>
      </section>

      {/* Tags Management */}
      <section className="profile-section">
        <div 
          className="setting-item clickable"
          onClick={() => navigate('/app/tags')}
        >
          <div className="setting-info">
            <div className="setting-label">Gestion des tags</div>
            <div className="setting-description">
              Personnalisez vos étiquettes et catégories
            </div>
          </div>
          <span className="arrow">→</span>
        </div>
      </section>

      {/* About */}
      <section className="profile-section">
        <h2 className="section-title">À propos</h2>
        
        <div className="about-info">
          <div className="info-item">
            <span className="info-label">Version</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mentions légales</span>
            <a href="/mentions-legales" className="info-link" target="_blank" rel="noopener noreferrer">
              Consulter
            </a>
          </div>
          <div className="info-item">
            <span className="info-label">CGU</span>
            <a href="/cgu" className="info-link" target="_blank" rel="noopener noreferrer">
              Consulter
            </a>
          </div>
          <div className="info-item">
            <span className="info-label">Support</span>
            <a href="mailto:support@instaconnect.com" className="info-link">
              support@instaconnect.com
            </a>
          </div>
        </div>
      </section>

      {/* Delete Account */}
      <div className="danger-zone">
        <button 
          className="btn-delete-account"
          onClick={handleDeleteAccount}
        >
          🗑️ Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
