import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import '../styles/Unfollowers.css';

const UnfollowersPage = () => {
  const navigate = useNavigate();
  const { contacts, updateContact } = useApp();
  const { currentUser } = useAuth();
  const [activeView, setActiveView] = useState('unfollowers');
  const [unfollowersData, setUnfollowersData] = useState(null);
  const [normalUnfollowersList, setNormalUnfollowersList] = useState([]);
  const [doNotFollowList, setDoNotFollowList] = useState([]);

  // Load unfollowers data from Firebase on mount
  useEffect(() => {
    loadUnfollowersFromFirebase();
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadUnfollowersFromFirebase = async () => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Load unfollowers data
        if (data.unfollowersData) {
          setUnfollowersData(data.unfollowersData);
        }
        
        // Load lists
        if (data.normalUnfollowers) {
          setNormalUnfollowersList(data.normalUnfollowers);
        }
        
        if (data.doNotFollowList) {
          setDoNotFollowList(data.doNotFollowList);
        }

        console.log('✅ Unfollowers data loaded from Firebase');
      }
    } catch (error) {
      console.error('❌ Error loading unfollowers data:', error);
    }
  };

  // Get usernames from lists
  const unfollowers = unfollowersData?.unfollowers || [];
  const normalUnfollowers = normalUnfollowersList || [];
  const toUnfollow = doNotFollowList || [];

  // Group by first letter
  const groupByLetter = (usernamesList) => {
    const grouped = {};
    usernamesList.forEach(username => {
      const firstLetter = username[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(username);
    });
    return Object.keys(grouped).sort().map(letter => ({
      letter,
      usernames: grouped[letter]
    }));
  };

  const handleTagAsNormal = async (username) => {
    // Add to normalUnfollowers in Firebase
    const newNormalList = [...normalUnfollowersList, username];
    setNormalUnfollowersList(newNormalList);

    // Remove from unfollowers
    const newUnfollowers = unfollowers.filter(u => u !== username);
    const updatedData = {
      ...unfollowersData,
      unfollowers: newUnfollowers
    };
    setUnfollowersData(updatedData);

    // Save to Firebase
    await saveToFirebase({
      unfollowersData: updatedData,
      normalUnfollowers: newNormalList
    });
  };

  const handleTagAsUnfollow = async (username) => {
    // Add to doNotFollowList
    const newDoNotFollowList = [...doNotFollowList, username];
    setDoNotFollowList(newDoNotFollowList);

    // Remove from unfollowers
    const newUnfollowers = unfollowers.filter(u => u !== username);
    const updatedData = {
      ...unfollowersData,
      unfollowers: newUnfollowers
    };
    setUnfollowersData(updatedData);

    // Save to Firebase
    await saveToFirebase({
      unfollowersData: updatedData,
      doNotFollowList: newDoNotFollowList
    });

    // Delete contact if exists
    const contactToDelete = contacts.find(c => 
      c.instagram.toLowerCase().replace('@', '') === username.toLowerCase()
    );

    if (contactToDelete) {
      await updateContact(contactToDelete.id, { deleted: true });
    }
  };

  const handleRemoveTag = async (username) => {
    // Determine which list it's in
    if (normalUnfollowersList.includes(username)) {
      const newList = normalUnfollowersList.filter(u => u !== username);
      setNormalUnfollowersList(newList);

      // Add back to unfollowers
      const newUnfollowers = [...unfollowers, username];
      const updatedData = {
        ...unfollowersData,
        unfollowers: newUnfollowers
      };
      setUnfollowersData(updatedData);

      await saveToFirebase({
        unfollowersData: updatedData,
        normalUnfollowers: newList
      });
    } else if (doNotFollowList.includes(username)) {
      const newList = doNotFollowList.filter(u => u !== username);
      setDoNotFollowList(newList);

      // Add back to unfollowers
      const newUnfollowers = [...unfollowers, username];
      const updatedData = {
        ...unfollowersData,
        unfollowers: newUnfollowers
      };
      setUnfollowersData(updatedData);

      await saveToFirebase({
        unfollowersData: updatedData,
        doNotFollowList: newList
      });
    }

    // Switch back to unfollowers view
    setActiveView('unfollowers');
  };

  const saveToFirebase = async (data) => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      await setDoc(doc(db, 'users', userId), data, { merge: true });
      
      console.log('✅ Unfollowers data saved to Firebase');
    } catch (error) {
      console.error('❌ Error saving to Firebase:', error);
    }
  };

  const openInstagram = (username) => {
    window.open('https://instagram.com/' + username, '_blank');
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

  const renderContactsList = (usernamesList, showActions = true) => {
    const grouped = groupByLetter(usernamesList);

    if (usernamesList.length === 0) {
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
              {group.usernames.map(username => (
                <div key={username} className="unfollower-card">
                  <div className="unfollower-info">
                    <div className="unfollower-name">@{username}</div>
                    <div className="unfollower-instagram">
                      <button 
                        onClick={() => openInstagram(username)}
                        className="instagram-link-button"
                      >
                        Voir le profil →
                      </button>
                    </div>
                  </div>
                  {showActions ? (
                    <div className="unfollower-actions">
                      <button
                        className="btn-tag-normal"
                        onClick={() => handleTagAsNormal(username)}
                        title="Marquer comme unfollower normal"
                      >
                        ✅
                      </button>
                      <button
                        className="btn-tag-unfollow"
                        onClick={() => handleTagAsUnfollow(username)}
                        title="À ne plus suivre"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn-remove-tag"
                      onClick={() => handleRemoveTag(username)}
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
      <div className="unfollowers-banner">
        <div className="banner-icon">💔</div>
        <div className="banner-info">
          <h1>{unfollowers.length} Unfollowers</h1>
          <p className="banner-description">
            Les unfollowers sont des personnes que vous suivez mais qui ne vous suivent pas en retour.
          </p>
        </div>
      </div>

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
