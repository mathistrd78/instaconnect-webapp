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
  const [normalFilter, setNormalFilter] = useState('all'); // all, disabled, business, celebrity
  const [unfollowersData, setUnfollowersData] = useState(null);
  const [normalUnfollowersList, setNormalUnfollowersList] = useState([]);
  const [normalCategories, setNormalCategories] = useState({});
  const [doNotFollowList, setDoNotFollowList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset search when changing view
  useEffect(() => {
    setSearchTerm('');
    setNormalFilter('all');
  }, [activeView]);

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
        
        if (data.normalCategories) {
          setNormalCategories(data.normalCategories);
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

  // Filter normal unfollowers by category
  const getFilteredNormalUnfollowers = () => {
    if (normalFilter === 'all') return normalUnfollowers;
    return normalUnfollowers.filter(username => 
      normalCategories[username] === normalFilter
    );
  };

  // Filter by search
  const filterBySearch = (usernamesList) => {
    if (!searchTerm) return usernamesList;
    return usernamesList.filter(username => 
      username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get first alphabetic letter (ignore special chars)
  const getFirstLetter = (username) => {
    const match = username.match(/[a-zA-Z]/);
    return match ? match[0].toUpperCase() : '#';
  };

  // Group by first letter
  const groupByLetter = (usernamesList) => {
    const grouped = {};
    usernamesList.forEach(username => {
      const firstLetter = getFirstLetter(username);
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(username);
    });
    
    // Sort letters (# at the end)
    const letters = Object.keys(grouped).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    });
    
    return letters.map(letter => ({
      letter,
      usernames: grouped[letter]
    }));
  };

  const handleTagAsNormal = async (username) => {
    // Check if already in list (prevent duplicates)
    if (normalUnfollowersList.includes(username)) {
      // Remove from unfollowers anyway
      const newUnfollowers = unfollowers.filter(u => u !== username);
      const updatedData = {
        ...unfollowersData,
        unfollowers: newUnfollowers
      };
      setUnfollowersData(updatedData);
      await saveToFirebase({
        unfollowersData: updatedData
      });
      return;
    }

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
      normalUnfollowers: newNormalList,
      normalCategories
    });
  };

  const handleTagAsUnfollow = async (username) => {
    // Check if already in list (prevent duplicates)
    if (doNotFollowList.includes(username)) {
      // Remove from unfollowers anyway
      const newUnfollowers = unfollowers.filter(u => u !== username);
      const updatedData = {
        ...unfollowersData,
        unfollowers: newUnfollowers
      };
      setUnfollowersData(updatedData);
      await saveToFirebase({
        unfollowersData: updatedData
      });
      return;
    }

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

  const handleToggleCategory = async (username, category) => {
    const newCategories = { ...normalCategories };
    
    // Toggle: if already this category, remove it; otherwise set it
    if (newCategories[username] === category) {
      delete newCategories[username];
    } else {
      newCategories[username] = category;
    }
    
    setNormalCategories(newCategories);
    
    await saveToFirebase({
      normalCategories: newCategories
    });
  };

  const handleRemoveFromNormal = async (username) => {
    const newList = normalUnfollowersList.filter(u => u !== username);
    setNormalUnfollowersList(newList);

    // Remove category too
    const newCategories = { ...normalCategories };
    delete newCategories[username];
    setNormalCategories(newCategories);

    // Add back to unfollowers (prevent duplicates)
    const newUnfollowers = unfollowers.includes(username) 
      ? unfollowers 
      : [...unfollowers, username];
    const updatedData = {
      ...unfollowersData,
      unfollowers: newUnfollowers
    };
    setUnfollowersData(updatedData);

    await saveToFirebase({
      unfollowersData: updatedData,
      normalUnfollowers: newList,
      normalCategories: newCategories
    });

    // Switch back to unfollowers view
    setActiveView('unfollowers');
  };

  const handleRemoveTag = async (username) => {
    const newList = doNotFollowList.filter(u => u !== username);
    setDoNotFollowList(newList);

    // Add back to unfollowers (prevent duplicates)
    const newUnfollowers = unfollowers.includes(username) 
      ? unfollowers 
      : [...unfollowers, username];
    const updatedData = {
      ...unfollowersData,
      unfollowers: newUnfollowers
    };
    setUnfollowersData(updatedData);

    await saveToFirebase({
      unfollowersData: updatedData,
      doNotFollowList: newList
    });

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
    if (searchTerm) return 'Aucun résultat';
    
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

  const renderUnfollowersList = (usernamesList) => {
    const filteredList = filterBySearch(usernamesList);
    const grouped = groupByLetter(filteredList);

    if (filteredList.length === 0) {
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
                    <div 
                      className="unfollower-name"
                      onClick={() => openInstagram(username)}
                    >
                      @{username}
                    </div>
                  </div>
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
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNormalUnfollowersList = () => {
    const filteredByCategory = getFilteredNormalUnfollowers();
    const filteredBySearch = filterBySearch(filteredByCategory);
    const grouped = groupByLetter(filteredBySearch);

    if (filteredBySearch.length === 0) {
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
              {group.usernames.map(username => {
                const category = normalCategories[username];
                return (
                  <div key={username} className="unfollower-card">
                    <div className="unfollower-info">
                      <div 
                        className="unfollower-name"
                        onClick={() => openInstagram(username)}
                      >
                        @{username}
                      </div>
                    </div>
                    <div className="unfollower-actions">
                      <button
                        className={`btn-category ${category === 'disabled' ? 'active' : ''}`}
                        onClick={() => handleToggleCategory(username, 'disabled')}
                        title="Compte désactivé"
                      >
                        🚫
                      </button>
                      <button
                        className={`btn-category ${category === 'business' ? 'active' : ''}`}
                        onClick={() => handleToggleCategory(username, 'business')}
                        title="Marque"
                      >
                        💼
                      </button>
                      <button
                        className={`btn-category ${category === 'celebrity' ? 'active' : ''}`}
                        onClick={() => handleToggleCategory(username, 'celebrity')}
                        title="Célébrité"
                      >
                        ⭐
                      </button>
                      <button
                        className="btn-remove-tag"
                        onClick={() => handleRemoveFromNormal(username)}
                        title="Retirer de cette liste"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderToUnfollowList = (usernamesList) => {
    const filteredList = filterBySearch(usernamesList);
    const grouped = groupByLetter(filteredList);

    if (filteredList.length === 0) {
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
                    <div 
                      className="unfollower-name"
                      onClick={() => openInstagram(username)}
                    >
                      @{username}
                    </div>
                  </div>
                  <button
                    className="btn-remove-tag-red"
                    onClick={() => handleRemoveTag(username)}
                    title="Retirer de cette liste"
                  >
                    ❌
                  </button>
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
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {renderUnfollowersList(unfollowers)}
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
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filters">
              <button
                className={`filter-btn ${normalFilter === 'all' ? 'active' : ''}`}
                onClick={() => setNormalFilter('all')}
              >
                Tous
              </button>
              <button
                className={`filter-btn ${normalFilter === 'disabled' ? 'active' : ''}`}
                onClick={() => setNormalFilter('disabled')}
              >
                🚫 Désactivés
              </button>
              <button
                className={`filter-btn ${normalFilter === 'business' ? 'active' : ''}`}
                onClick={() => setNormalFilter('business')}
              >
                💼 Marques
              </button>
              <button
                className={`filter-btn ${normalFilter === 'celebrity' ? 'active' : ''}`}
                onClick={() => setNormalFilter('celebrity')}
              >
                ⭐ Célébrités
              </button>
            </div>
            {renderNormalUnfollowersList()}
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
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {renderToUnfollowList(toUnfollow)}
          </>
        )}
      </div>
    </div>
  );
};

export default UnfollowersPage;
