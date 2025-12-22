import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import '../styles/Analyse.css';

const AnalysePage = () => {
  const navigate = useNavigate();
  const { contacts, addContact, deleteMultipleContacts } = useApp();
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [deletedContacts, setDeletedContacts] = useState([]); // Store deleted contacts info
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      setResults(null);
      setDeletedContacts([]);
    } else {
      alert('Veuillez sélectionner un fichier ZIP');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.zip')) {
      setFile(droppedFile);
      setResults(null);
      setDeletedContacts([]);
    } else {
      alert('Veuillez déposer un fichier ZIP');
    }
  };

  const handleResultClick = (type) => {
    switch(type) {
      case 'created':
        // Redirect to contacts page with "new" filter
        navigate('/app/contacts', { 
          state: { 
            showNewContacts: true,
            createdAfter: new Date().toISOString()
          }
        });
        break;
      case 'deleted':
        // Show deleted contacts list in modal
        if (deletedContacts.length > 0) {
          showDeletedContactsModal();
        }
        break;
      case 'unfollowers':
        navigate('/app/unfollowers');
        break;
      case 'fans':
        navigate('/app/fans');
        break;
      case 'pending':
        navigate('/app/demandes');
        break;
      default:
        break;
    }
  };

  const showDeletedContactsModal = () => {
    const overlay = document.createElement('div');
    overlay.id = 'deletedContactsModal';
    overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;';
    
    const sortedDeleted = [...deletedContacts].sort((a, b) => a.localeCompare(b));
    
    overlay.innerHTML = `
      <div class="modal-content-deleted" style="background: var(--surface); border-radius: 16px; max-width: 500px; width: 100%; max-height: 80vh; overflow: hidden; display: flex; flex-direction: column;">
        <div class="modal-header-deleted" style="padding: 20px; border-bottom: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 18px; color: var(--text-primary);">Contacts supprimés (${deletedContacts.length})</h3>
            <button onclick="document.getElementById('deletedContactsModal').remove()" class="modal-close-btn" style="background: var(--border-color); border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 20px; color: var(--text-primary);">✕</button>
          </div>
        </div>
        <div class="modal-list-content" style="padding: 16px; overflow-y: auto; flex: 1;">
          ${sortedDeleted.map(username => `
            <div style="padding: 12px; background: var(--background); border-radius: 8px; margin-bottom: 8px; color: var(--text-primary);">
              ${username}
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('deletedContactsModal')?.remove();
    document.body.appendChild(overlay);
    
    overlay.onclick = (e) => {
      if (e.target === overlay) overlay.remove();
    };
  };

  const analyzeFile = async () => {
    if (!file) {
      alert('Veuillez d\'abord sélectionner un fichier');
      return;
    }

    setAnalyzing(true);
    setProgress('Extraction du fichier ZIP...');
    
    try {
      // Load JSZip
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      
      setProgress('Lecture des fichiers...');

      // Extract files
      let followersData = [];
      let followingData = [];
      let pendingData = null;
      
      // Find followers file
      const followersFile = zip.file(/followers_\d+\.json/)[0] || 
                           zip.file('followers_and_following/followers_1.json') ||
                           zip.file('followers_and_following/followers.json');
      
      // Find following file
      const followingFile = zip.file(/following\.json/)[0] || 
                           zip.file('followers_and_following/following.json');
      
      // Find pending requests file
      const pendingFile = zip.file(/pending_follow_requests\.json/)[0] ||
                         zip.file('followers_and_following/pending_follow_requests.json');
      
      if (!followersFile || !followingFile) {
        throw new Error('Fichiers following.json ou followers_1.json introuvables dans le ZIP');
      }

      // Parse followers
      const followersContent = await followersFile.async('text');
      const followersParsed = JSON.parse(followersContent);
      followersData = followersParsed.relationships_followers || followersParsed || [];
      
      // Parse following
      const followingContent = await followingFile.async('text');
      const followingParsed = JSON.parse(followingContent);
      followingData = followingParsed.relationships_following || followingParsed || [];
      
      // Parse pending requests if exists
      if (pendingFile) {
        const pendingContent = await pendingFile.async('text');
        const pendingParsed = JSON.parse(pendingContent);
        pendingData = pendingParsed;
      }

      setProgress('Analyse des followers...');

      // Extract usernames
      const followers = followersData.map(item => 
        item.string_list_data?.[0]?.value || item.title || item.username || item
      ).filter(Boolean);
      
      const following = followingData.map(item =>
        item.string_list_data?.[0]?.value || item.title || item.username || item
      ).filter(Boolean);

      // Create sets for faster lookup
      const followingSet = new Set(following.map(u => u.toLowerCase()));
      const followersSet = new Set(followers.map(u => u.toLowerCase()));

      // Load normalUnfollowers and doNotFollowList from Firebase
      let normalUnfollowers = [];
      let doNotFollowList = [];

      if (currentUser) {
        try {
          const userId = currentUser.uid;
          const userDocRef = doc(db, 'users', userId);
          const userDocSnapshot = await getDoc(userDocRef);
          
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            normalUnfollowers = userData.normalUnfollowers || [];
            doNotFollowList = userData.doNotFollowList || [];
            
            console.log(`📋 Loaded ${normalUnfollowers.length} normal unfollowers`);
            console.log(`🚫 Loaded ${doNotFollowList.length} do not follow`);
          }
        } catch (error) {
          console.error('Error loading unfollowers lists:', error);
        }
      }

      // Create sets for filtering
const normalUnfollowersSet = new Set(normalUnfollowers.map(u => u.toLowerCase()));

// Calculate stats - FILTER OUT ONLY normal unfollowers (NOT doNotFollowList)
const unfollowers = following.filter(u => {
  const lowerU = u.toLowerCase();
  return !followersSet.has(lowerU) && 
         !normalUnfollowersSet.has(lowerU);
  // NOTE: On n'exclut PAS doNotFollowList car l'utilisateur peut re-suivre ces comptes
});

const fans = followers.filter(f => !followingSet.has(f.toLowerCase()));
const mutualFollowers = following.filter(u => followersSet.has(u.toLowerCase()));

// Extract pending requests
let pendingRequests = [];
if (pendingData && pendingData.relationships_follow_requests_sent) {
  pendingRequests = pendingData.relationships_follow_requests_sent
    .flatMap(item => item.string_list_data || [])
    .map(entry => entry.value)
    .filter(Boolean);
}

console.log(`📊 Stats: ${followers.length} followers, ${following.length} following`);
console.log(`💔 ${unfollowers.length} unfollowers (filtered - excluding normalUnfollowers only)`);
console.log(`🫶 ${fans.length} fans`);
console.log(`⏳ ${pendingRequests.length} pending requests`);

      // ÉTAPE 1 : VÉRIFIER les contacts à supprimer (SANS LES SUPPRIMER)
      setProgress('Vérification des contacts existants...');
      
      const contactsToDelete = [];
      const followerUsernamesLower = followers.map(f => f.toLowerCase());
      
      for (const contact of contacts) {
        const instagramUsername = (contact.instagram || '').toLowerCase().replace('@', '');
        if (instagramUsername && !followerUsernamesLower.includes(instagramUsername)) {
          contactsToDelete.push(contact);
        }
      }
      
      // ÉTAPE 2 : Si des suppressions sont détectées, demander confirmation AVANT toute modification
      if (contactsToDelete.length > 0) {
        console.log(`⚠️ ${contactsToDelete.length} contact(s) to delete - asking for confirmation BEFORE any modification...`);
        
        const confirmed = window.confirm(
          `⚠️ ATTENTION\n\n` +
          `${contactsToDelete.length} fiche(s) contact(s) vont être supprimées.\n\n` +
          `Souhaitez-vous continuer ?\n\n` +
          `Si ce nombre vous paraît incohérent, vérifiez que vous avez bien sélectionné "Depuis le début" lors de l'export Instagram.`
        );
        
        if (!confirmed) {
          // ANNULATION COMPLÈTE - Aucune modification effectuée
          console.log('❌ Analysis cancelled by user - NO modifications made');
          setAnalyzing(false);
          setProgress('');
          
          alert(
            `❌ Analyse annulée, aucune modification effectuée.\n\n` +
            `Si le nombre de fiches contacts à supprimer vous paraît incohérent, ` +
            `vérifiez que vous avez bien sélectionné "Depuis le début" lors de l'export Instagram.`
          );
          
          return; // Arrêter l'analyse complètement
        }
      }
      
      // ÉTAPE 3 : L'utilisateur a confirmé (ou pas de suppressions), procéder aux modifications
      
      setProgress('Suppression des contacts...');
      
      // Supprimer les contacts et stocker la liste
      let deletedCount = 0;
      const deletedUsernames = [];
      
      if (contactsToDelete.length > 0) {
        console.log(`🗑️ User confirmed - Deleting ${contactsToDelete.length} contact(s)...`);
        
        // Store deleted usernames for modal
        deletedUsernames.push(...contactsToDelete.map(c => c.instagram || c.firstName));
        
        const contactIdsToDelete = contactsToDelete.map(c => c.id);
        await deleteMultipleContacts(contactIdsToDelete);
        deletedCount = contactsToDelete.length;
        
        console.log(`✅ ${deletedCount} contact(s) deleted`);
      }

      setProgress('Création des fiches contacts...');

      // Create contact cards for mutual followers
      let created = 0;
      let alreadyExists = 0;

      for (const username of mutualFollowers) {
        // Check if contact already exists (by Instagram username)
        const existingContact = contacts.find(c => {
          const contactUsername = (c.instagram || '').toLowerCase().replace('@', '');
          return contactUsername === username.toLowerCase();
        });

        if (existingContact) {
          alreadyExists++;
          continue;
        }

        // Create new contact
        const newContact = {
          firstName: `@${username}`,
          instagram: `@${username}`,
          relationType: '',
          meetingPlace: '',
          discussionStatus: '',
          gender: '',
          location: '',
          birthDate: '',
          nextMeeting: '',
          notes: ''
        };

        await addContact(newContact);
        created++;
        
        // Update progress every 10 contacts
        if (created % 10 === 0) {
          setProgress(`Création des fiches contacts... (${created} créées)`);
        }
      }

      setProgress('Sauvegarde des données Instagram...');

      // Save Instagram data to Firebase
      if (currentUser) {
        const userId = currentUser.uid;
        await setDoc(doc(db, 'users', userId), {
          unfollowersData: {
            following: following,
            followers: followers,
            unfollowers: unfollowers,
            lastUpdate: new Date().toISOString()
          },
          pendingRequests: pendingRequests
        }, { merge: true });
        
        console.log('✅ Instagram data saved to Firebase');
      }

      // Store deleted contacts for modal
      setDeletedContacts(deletedUsernames);

      // Show results
      setResults({
        created,
        deleted: deletedCount,
        unfollowers: unfollowers.length,
        fans: fans.length,
        pendingRequests: pendingRequests.length,
        totalFollowers: followers.length,
        totalFollowing: following.length
      });

      setProgress('');
      
    } catch (error) {
      console.error('❌ Error analyzing file:', error);
      alert('Erreur lors de l\'analyse du fichier. Vérifiez qu\'il s\'agit bien d\'un export Instagram complet.');
      setProgress('');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="analyse-page">
      <div className="analyse-header">
        <h1>🔍 Analyse Instagram</h1>
        <p className="analyse-subtitle">
          Créez automatiquement des fiches contacts pour vos followers mutuels
        </p>
      </div>

      <div className="analyse-container">
        {/* Upload Zone */}
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {file ? (
            <>
              <div className="upload-icon">✅</div>
              <div className="upload-text">{file.name}</div>
              <div className="upload-subtext">Cliquez sur "Lancer l'analyse" ci-dessous</div>
            </>
          ) : (
            <>
              <div className="upload-icon">📤</div>
              <div className="upload-text">Sélectionnez votre export Instagram</div>
              <div className="upload-subtext">Glissez-déposez ou cliquez pour sélectionner (ZIP uniquement)</div>
            </>
          )}
        </div>

        {/* Analyze Button */}
        <button
          className="btn-analyze"
          onClick={analyzeFile}
          disabled={!file || analyzing}
        >
          {analyzing ? '🔄 Analyse en cours...' : '🚀 Lancer l\'analyse complète'}
        </button>

        {/* Progress */}
        {analyzing && progress && (
          <div className="analyse-progress">
            <div className="progress-text">{progress}</div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="analyse-results">
            <h3>✅ Analyse terminée !</h3>
            <div className="results-grid">
              {results.created > 0 && (
                <div 
                  className="result-card success clickable" 
                  onClick={() => handleResultClick('created')}
                  title="Cliquez pour voir les nouveaux contacts"
                >
                  <div className="result-label">Contacts créés</div>
                  <div className="result-value">{results.created}</div>
                </div>
              )}
              {results.deleted > 0 && (
                <div 
                  className="result-card danger clickable" 
                  onClick={() => handleResultClick('deleted')}
                  title="Cliquez pour voir la liste"
                >
                  <div className="result-label">Contacts supprimés</div>
                  <div className="result-value">{results.deleted}</div>
                </div>
              )}
              <div 
                className="result-card clickable" 
                onClick={() => handleResultClick('unfollowers')}
                title="Cliquez pour voir les unfollowers"
              >
                <div className="result-label">Unfollowers</div>
                <div className="result-value">{results.unfollowers}</div>
              </div>
              <div 
                className="result-card clickable" 
                onClick={() => handleResultClick('fans')}
                title="Cliquez pour voir les fans"
              >
                <div className="result-label">Fans</div>
                <div className="result-value">{results.fans}</div>
              </div>
              <div 
                className="result-card clickable" 
                onClick={() => handleResultClick('pending')}
                title="Cliquez pour voir les demandes"
              >
                <div className="result-label">Demandes en attente</div>
                <div className="result-value">{results.pendingRequests}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="analyse-instructions">
          <h3>📱 Comment exporter vos données Instagram ?</h3>

          {/* Mobile Instructions */}
          <div className="instructions-section">
            <h4>📱 Sur mobile</h4>
            <ol>
              <li>Allez sur votre application Instagram</li>
              <li>Allez sur votre <strong>Profil</strong></li>
              <li>Cliquez sur <strong>"Plus"</strong> (icône avec 3 barres horizontales) en haut à droite</li>
              <li>Cliquez sur <strong>"Espaces comptes"</strong></li>
              <li>Cliquez sur <strong>"Vos informations et autorisations"</strong></li>
              <li>Cliquez sur <strong>"Exporter vos informations"</strong></li>
              <li>Cliquez sur <strong>"Créer une exportation"</strong>, puis sélectionnez votre profil et cliquez sur <strong>"Exporter sur mon appareil"</strong></li>
              <li>Dans <strong>"Personnaliser les informations"</strong> décochez tout sauf <strong>"Followers et suivi(e)s"</strong></li>
              <li>Dans <strong>"Période"</strong>, sélectionnez <strong>"Depuis le début"</strong></li>
              <li>Dans <strong>"Format"</strong>, sélectionnez <strong>"JSON"</strong></li>
              <li>Enfin, appuyez sur <strong>"Commencer l'exportation"</strong> et attendez (le temps dépend du nombre d'informations)</li>
            </ol>
          </div>

          {/* Desktop Instructions */}
          <div className="instructions-section">
            <h4>💻 Sur ordinateur</h4>
            <ol>
              <li>Allez sur le site web Instagram</li>
              <li>Cliquez sur <strong>"Plus"</strong> (icône avec 3 barres horizontales) en bas à gauche</li>
              <li>Cliquez sur <strong>"Paramètres"</strong></li>
              <li>Cliquez sur <strong>"Espaces comptes"</strong></li>
              <li>Cliquez sur <strong>"Vos informations et autorisations"</strong></li>
              <li>Cliquez sur <strong>"Exporter vos informations"</strong></li>
              <li>Cliquez sur <strong>"Créer une exportation"</strong>, puis sélectionnez votre profil</li>
              <li>Dans <strong>"Personnaliser les informations"</strong> décochez tout sauf <strong>"Followers et suivi(e)s"</strong></li>
              <li>Dans <strong>"Période"</strong>, sélectionnez <strong>"Depuis le début"</strong></li>
              <li>Dans <strong>"Format"</strong>, sélectionnez <strong>"JSON"</strong></li>
              <li>Cliquez sur <strong>"Créer les fichiers"</strong></li>
              <li>Vous recevrez un email avec le lien de téléchargement (cela peut prendre quelques minutes)</li>
            </ol>
          </div>

          {/* Note */}
          <div className="instructions-note">
            <strong>⏱️ Note :</strong> Le traitement peut prendre de quelques minutes à quelques heures selon la quantité de données. 
            Vous recevrez un email d'Instagram quand votre export sera prêt à télécharger.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysePage;
