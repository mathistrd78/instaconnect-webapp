import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import '../styles/Unfollowers.css';

const UnfollowersPage = () => {
  const navigate = useNavigate();
  const { contacts, updateContact } = useApp();
  const [activeView, setActiveView] = useState('unfollowers'); // 'unfollowers', 'normal', 'unfollow'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter contacts
  const unfollowers = contacts.filter(c => 
    c.isUnfollower && !c.unfollowerType
  );

  const normalUnfollowers = contacts.filter(c => 
    c.isUnfollower && c.unfollowerType === 'normal'
  );

  const toUnfollow = contacts.filter(c => 
    c.isUnfollower && c.unfollowerType === 'unfollow'
  );

  // Group by first letter
  const groupByLetter = (contactsList) => {
    const grouped = {};
    contactsList.forEach(contact => {
      const firstLetter = (contact.firstName || contact.instagram || '?')[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(contact);
    });
    return Object.keys(grouped).sort().map(letter => ({
      letter,
      contacts: grouped[letter]
    }));
  };

  const handleTagAsNormal = async (contact) => {
    await updateContact(contact.id, {
      unfollowerType: 'normal'
    });
  };

  const handleTagAsUnfollow = async (contact) => {
    await updateContact(contact.id, {
      unfollowerType: 'unfollow'
    });
  };

  const handleRemoveTag = async (contact) => {
    await updateContact(contact.id, {
      unfollowerType: null
    });
  };

  const getEmptyMessage = () => {
    switch (activeView) {
      case 'unfollowers':
        return (
          <>
            Aucun contact dans cette liste.
            <br />
            Veuillez lancer une nouvelle analyse.
          </>
        );
      case 'normal':
        return (
          <>
            Aucun contact dans cette liste.
            <br />
            Veuillez taguez des personnes avec le bouton ✅ sur la liste des unfollowers.
          </>
        );
      case 'unfollow':
        return (
          <>
            Aucun contact dans cette liste.
            <br />
            Veuillez taguez des personnes avec le bouton ❌ sur la liste des unfollowers.
          </>
        );
      default:
        return 'Aucun contact dans cette liste';
    }
  };

  const renderContactsList = (contactsList, showActions = true) => {
    const grouped = groupByLetter(contactsList);

    if (contactsList.length === 0) {
      return (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <p>{getEmptyMessage()}</p>
        </div>
      );
    }

    return (
      <div className="contacts-list">
        {grouped.map(group => (
          <div key={group.letter} className="letter-group">
            <div className="letter-divider">{group.letter}</div>
            <div className="contacts-group">
              {group.contacts.map(contact => (
                <div key={contact.id} className="unfollower-card">
                  <div className="unfollower-info">
                    <div className="unfollower-name">
                      {contact.firstName || 'Sans nom'}
                    </div>
                    <div className="unfollower-instagram">
                      @{contact.instagram}
                    </div>
                  </div>
                  {showActions ? (
                    <div className="unfollower-actions">
                      <button
                        className="btn-tag-normal"
                        onClick={() => handleTagAsNormal(contact)}
                        title="Marquer comme unfollower normal"
                      >
                        ✅
                      </button>
                      <button
                        className="btn-tag-unfollow"
                        onClick={() => handleTagAsUnfollow(contact)}
                        title="À ne plus suivre"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-remove-tag"
                      onClick={() => handleRemoveTag(contact)}
                      title="Retirer de cette liste"
                    >
                      ↩️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="unfollowers-page">
      {/* Header Banner */}
      <div className="unfollowers-banner">
        <div className="banner-icon">💔</div>
        <div className="banner-info">
          <h1>{unfollowers.length} Unfollowers</h1>
          <p className="banner-description">
            Les unfollowers sont des personnes que vous suivez mais qui ne vous suivent pas en retour.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="unfollowers-nav">
        <button
          className={`nav-button ${activeView === 'unfollowers' ? 'active' : ''}`}
          onClick={() => setActiveView('unfollowers')}
        >
          <span className="nav-icon">💔</span>
          <span className="nav-label">Unfollowers</span>
          <span className="nav-count">{unfollowers.length}</span>
        </button>
        <button
          className={`nav-button ${activeView === 'normal' ? 'active' : ''}`}
          onClick={() => setActiveView('normal')}
        >
          <span className="nav-icon">✅</span>
          <span className="nav-label">Unfollowers normaux</span>
          <span className="nav-count">{normalUnfollowers.length}</span>
        </button>
        <button
          className={`nav-button ${activeView === 'unfollow' ? 'active' : ''}`}
          onClick={() => setActiveView('unfollow')}
        >
          <span className="nav-icon">❌</span>
          <span className="nav-label">À ne plus suivre</span>
          <span className="nav-count">{toUnfollow.length}</span>
        </button>
      </div>

      {/* Content */}
      <div className="unfollowers-content">
        {activeView === 'unfollowers' && (
          <>
            <div className="content-header">
              <h2>Liste des unfollowers</h2>
              <p className="content-description">
                Faites le tri dans vos unfollowers et classifiez les dans des listes
              </p>
            </div>
            {renderContactsList(unfollowers, true)}
          </>
        )}

        {activeView === 'normal' && (
          <>
            <div className="content-header">
              <h2>Unfollowers normaux</h2>
              <p className="content-description">
                Classifiez les comptes qui ne vous suivent pas entre célébrité, marque, compte désactivé
              </p>
            </div>
            {renderContactsList(normalUnfollowers, false)}
          </>
        )}

        {activeView === 'unfollow' && (
          <>
            <div className="content-header">
              <h2>À ne plus suivre</h2>
              <p className="content-description">
                Comptes que vous avez décidé d'unfollow, à ne plus suivre de nouveau
              </p>
            </div>
            {renderContactsList(toUnfollow, false)}
          </>
        )}
      </div>
    </div>
  );
};

export default UnfollowersPage;
