import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import '../styles/PendingRequests.css';

const PendingRequestsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userId = currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));

      if (userDoc.exists()) {
        const data = userDoc.data();
        const requests = data.pendingRequests || [];
        setPendingRequests(requests);
      }
    } catch (error) {
      console.error('❌ Error loading pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (username) => {
    if (!window.confirm(`Supprimer la demande pour ${username} ?`)) {
      return;
    }

    try {
      const userId = currentUser.uid;
      const updatedRequests = pendingRequests.filter(req => req !== username);
      
      await setDoc(doc(db, 'users', userId), {
        pendingRequests: updatedRequests
      }, { merge: true });

      setPendingRequests(updatedRequests);
    } catch (error) {
      console.error('❌ Error canceling request:', error);
      alert('Erreur lors de la suppression');
    }
  };

  // Filter requests based on search query
  const filteredRequests = pendingRequests.filter(username =>
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

  const groupedRequests = groupByLetter(filteredRequests);
  const letters = Object.keys(groupedRequests).sort();

  const handleUsernameClick = (username) => {
    const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
    window.open(`https://instagram.com/${cleanUsername}`, '_blank');
  };

  if (loading) {
    return (
      <div className="pending-requests-page">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="pending-requests-page">
      <div className="pending-requests-header">
        <div className="pending-requests-banner">
          <div className="banner-icon">⏳</div>
          <div className="banner-content">
            <div className="banner-count">{pendingRequests.length} Demandes en attente</div>
            <div className="banner-description">
              Comptes privés dont votre demande est toujours en attente
            </div>
          </div>
        </div>
      </div>

      <div className="pending-requests-content">
        <div className="content-header">
          <h2>Liste des demandes en attente</h2>
        </div>

        {pendingRequests.length === 0 ? (
  <div className="empty-state">
    <div className="empty-icon">⏳</div>
    <p className="empty-message">Aucun contact dans cette liste.</p>
    <p className="empty-description">
      Veuillez lancer une nouvelle analyse.
    </p>
  </div>
) : (
          <>
            <div className="search-container">
              <input
                type="text"
                placeholder="🔍 Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            {filteredRequests.length === 0 ? (
              <div className="no-results">
                <p>Aucun résultat pour "{searchQuery}"</p>
              </div>
            ) : (
              <div className="requests-list">
                {letters.map(letter => (
                  <div key={letter} className="letter-group">
                    <div className="letter-divider">{letter}</div>
                    <div className="usernames-list">
                      {groupedRequests[letter].map((username, index) => (
                        <div 
                          key={index} 
                          className="username-item"
                        >
                          <span 
                            className="username"
                            onClick={() => handleUsernameClick(username)}
                          >
                            {username}
                          </span>
                          <button
                            className="btn-cancel-request"
                            onClick={() => handleCancelRequest(username)}
                            title="Demande annulée"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredRequests.length > 0 && (
              <div className="requests-count-footer">
                {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} affichée{filteredRequests.length > 1 ? 's' : ''}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PendingRequestsPage;
