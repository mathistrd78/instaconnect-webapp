import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import '../styles/Fans.css';

const FansPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [fansData, setFansData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadFansData();
  }, []);

  const loadFansData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userId = currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        
        if (data.unfollowersData) {
          const following = data.unfollowersData.following || [];
          const followers = data.unfollowersData.followers || [];
          
          // Fans = followers qui ne sont pas dans following
          const fans = followers.filter(follower => !following.includes(follower));
          
          setFansData(fans);
        }
      }
    } catch (error) {
      console.error('❌ Error loading fans data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter fans based on search query
  const filteredFans = fansData.filter(username =>
    username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by first letter (ignoring special characters)
  const groupByLetter = (usernames) => {
    const groups = {};
    
    usernames.forEach(username => {
      // Get first letter, ignore special characters
      const firstChar = username.replace(/^[^a-zA-Z0-9]+/, '')[0]?.toUpperCase() || '#';
      const letter = /[A-Z0-9]/.test(firstChar) ? firstChar : '#';
      
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(username);
    });
    
    // Sort each group alphabetically
    Object.keys(groups).forEach(letter => {
      groups[letter].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    });
    
    return groups;
  };

  const groupedFans = groupByLetter(filteredFans);
  const letters = Object.keys(groupedFans).sort();

  const handleUsernameClick = (username) => {
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    window.open(`https://instagram.com/${cleanUsername}`, '_blank');
  };

  if (loading) {
    return (
      <div className="fans-page">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="fans-page">
      <div className="fans-header">
        <div className="fans-banner">
          <div className="banner-icon">🫶</div>
          <div className="banner-content">
            <div className="banner-count">{fansData.length} Fans</div>
            <div className="banner-description">
              Les fans sont des personnes qui vous suivent mais que vous ne suivez pas en retour
            </div>
          </div>
        </div>
      </div>

      <div className="fans-content">
        <div className="content-header">
          <h2>Liste des fans</h2>
        </div>

        {fansData.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🫶</div>
            <p className="empty-message">Aucun fan pour le moment</p>
            <p className="empty-description">
              Les personnes qui vous suivent sans que vous les suiviez en retour apparaîtront ici
            </p>
          </div>
        ) : (
          <>
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {filteredFans.length === 0 ? (
              <div className="no-results">
                <p>Aucun résultat pour "{searchQuery}"</p>
              </div>
            ) : (
              <div className="fans-list">
                {letters.map(letter => (
                  <div key={letter} className="letter-group">
                    <div className="letter-divider">{letter}</div>
                    <div className="usernames-list">
                      {groupedFans[letter].map((username, index) => (
                        <div 
                          key={index} 
                          className="username-item"
                          onClick={() => handleUsernameClick(username)}
                        >
                          <span className="username">{username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredFans.length > 0 && (
              <div className="fans-count-footer">
                {filteredFans.length} fan{filteredFans.length > 1 ? 's' : ''} affiché{filteredFans.length > 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FansPage;
