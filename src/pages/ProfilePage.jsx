import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { migrateTags } from '../scripts/migrateTags';
import '../styles/Profile.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { contacts, darkMode, toggleDarkMode } = useApp();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const instagramStats = {
    followers: 0,
    following: 0,
    unfollowers: 0,
    fans: 0,
    pendingRequests: 0
  };

  const totalContacts = contacts.length;

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

  const handleMigrateTags = async () => {
    if (window.confirm('⚠️ Cette opération va créer automatiquement tous les tags utilisés dans vos contacts. Continuer ?')) {
      try {
        const result = await migrateTags(currentUser.uid);
        if (result.success) {
          alert('✅ Migration réussie ! Vos tags ont été créés.');
          window.location.reload();
        } else {
          alert('❌ Erreur lors de la migration : ' + result.error);
        }
      } catch (error) {
        console.error('Error migrating tags:', error);
        alert('❌ Erreur lors de la migration');
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>⚙️ Paramètres</h1>
        <p className="profile-subtitle">Gérez votre compte et vos préférences</p>
      </div>

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

      <section className="profile-section">
        <h2 className="section-title">Apparence</h2>
        
        <div className="setting-item">
          <div className="setting-info">
            <div className="setting-label">Mode sombre</div>
            <div className="setting-description">
              {darkMode ? 'Activé' : 'Désactivé'}
            </div>
          </div>
          <div 
            className="switch" 
            onClick={(e) => {
              e.stopPropagation();
              toggleDarkMode();
            }}
          >
            <input 
              type="checkbox" 
              checked={darkMode}
              onChange={() => {}}
              readOnly
            />
            <span className="slider"></span>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="setting-item clickable" onClick={() => navigate('/app/champs')}>
          <div className="setting-info">
            <div className="setting-label">Gestion des champs</div>
            <div className="setting-description">Personnalisez les champs de vos contacts</div>
          </div>
          <span className="arrow">→</span>
        </div>
      </section>

      <section className="profile-section">
        <div className="setting-item clickable" onClick={() => navigate('/app/tags')}>
          <div className="setting-info">
            <div className="setting-label">Gestion des tags</div>
            <div className="setting-description">Personnalisez vos étiquettes et catégories</div>
          </div>
          <span className="arrow">→</span>
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-title">À propos</h2>
        
        <div className="about-info">
          <div className="info-item">
            <span className="info-label">Version</span>
            <span className="info-value">1.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mentions légales</span>
            <a href="/mentions-legales" className="info-link" target="_blank" rel="noopener noreferrer">Consulter</a>
          </div>
          <div className="info-item">
            <span className="info-label">CGU</span>
            <a href="/cgu" className="info-link" target="_blank" rel="noopener noreferrer">Consulter</a>
          </div>
          <div className="info-item">
            <span className="info-label">Support</span>
            <a href="mailto:support@instaconnect.com" className="info-link">support@instaconnect.com</a>
          </div>
        </div>
      </section>

      <div className="danger-zone">
        <button className="btn-migrate-tags" onClick={handleMigrateTags}>
          🔄 Migrer les tags
        </button>
        <button className="btn-delete-account" onClick={handleDeleteAccount}>
          🗑️ Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
