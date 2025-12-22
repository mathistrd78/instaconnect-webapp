import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Profile.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { contacts, darkMode, toggleDarkMode } = useApp();
  const [instagramStats, setInstagramStats] = useState({
    followers: 0,
    following: 0,
    unfollowers: 0,
    fans: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    loadInstagramStats();
  }, []);

  const loadInstagramStats = async () => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        if (data.unfollowersData) {
          const following = data.unfollowersData.following || [];
          const followers = data.unfollowersData.followers || [];
          const unfollowers = data.unfollowersData.unfollowers || [];
          
          // Calculate fans (followers not in following)
          const fans = followers.filter(follower => !following.includes(follower));
          
          // Get pending requests
          const pendingRequests = data.pendingRequests || [];
          
          setInstagramStats({
            followers: followers.length,
            following: following.length,
            unfollowers: unfollowers.length,
            fans: fans.length,
            pendingRequests: pendingRequests.length
          });
        }
      }
    } catch (error) {
      console.error('❌ Error loading Instagram stats:', error);
    }
  };

  const totalContacts = contacts.length;

  const accountCreationDate = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Date inconnue';

  const handleLogout = async () => {
    if (window.confirm('Se déconnecter ?')) {
      try {
        await logout();
        navigate('/auth');
      } catch (error) {
        console.error('Error logging out:', error);
        alert('Erreur lors de la déconnexion');
      }
    }
  };

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

  // Récupérer le champ "Déjà Pécho?"
  const handleRecoverDejaPecho = async () => {
    if (window.confirm('🔧 Récupérer le champ "Déjà Pécho?" ?\n\nCela va restaurer le champ dans vos champs personnalisés et migrer les données existantes.')) {
      try {
        const { recoverDejaPecho } = await import('../scripts/recoverDejaPecho');
        const result = await recoverDejaPecho(currentUser.uid);
        
        if (result.success) {
          let message = '✅ Champ récupéré avec succès !\n\n';
          
          if (result.migratedFrom) {
            message += `📦 Données migrées depuis: ${result.migratedFrom}\n`;
          }
          
          if (result.contactsUpdated) {
            message += '✅ Contacts mis à jour\n';
          }
          
          message += '\nLa page va se recharger...';
          
          alert(message);
          window.location.reload();
        } else {
          alert('❌ Erreur : ' + (result.error || 'Erreur inconnue'));
        }
      } catch (error) {
        console.error('Error recovering field:', error);
        alert('❌ Erreur lors de la récupération : ' + error.message);
      }
    }
  };

  // SCRIPT DE CORRECTION CONSERVÉ (commenté mais disponible)
  /*
  const handleFixFieldsStructure = async () => {
    if (window.confirm('🔧 Corriger la structure des champs ?\n\nCela replacera birthDate et nextMeeting dans les champs par défaut.')) {
      try {
        const { fixFieldsStructure } = await import('../scripts/fixFieldsStructure');
        const result = await fixFieldsStructure(currentUser.uid);
        
        if (result.success) {
          alert(`✅ Structure corrigée !\n\n${result.movedCount} champ(s) replacé(s)`);
          window.location.reload();
        } else {
          alert('❌ Erreur : ' + result.error);
        }
      } catch (error) {
        console.error('Error fixing fields:', error);
        alert('❌ Erreur lors de la correction');
      }
    }
  };
  */

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 Profil</h1>
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

      {/* Section Outils de maintenance */}
      <section className="profile-section">
        <h2 className="section-title">🔧 Outils de maintenance</h2>
        
        <div className="maintenance-tools">
          <button 
            className="btn-maintenance"
            onClick={handleRecoverDejaPecho}
          >
            <div className="btn-maintenance-content">
              <div className="btn-maintenance-icon">🔄</div>
              <div className="btn-maintenance-info">
                <div className="btn-maintenance-title">Récupérer "Déjà Pécho?"</div>
                <div className="btn-maintenance-desc">Restaure le champ personnalisé et migre les données</div>
              </div>
            </div>
          </button>
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
        <button className="btn-logout" onClick={handleLogout}>
          🚪 Se déconnecter
        </button>
        <button className="btn-delete-account" onClick={handleDeleteAccount}>
          🗑️ Supprimer mon compte
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
