import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import '../styles/Analyse.css';

const AnalysePage = () => {
  const { contacts, addContact, deleteMultipleContacts } = useApp();
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      setResults(null); // Reset results when new file is selected
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
    } else {
      alert('Veuillez déposer un fichier ZIP');
    }
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

      // Calculate stats
      const unfollowers = following.filter(u => !followersSet.has(u.toLowerCase()));
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
      console.log(`💔 ${unfollowers.length} unfollowers`);
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
      
      // Supprimer les contacts
      let deletedCount = 0;
      
      if (contactsToDelete.length > 0) {
        console.log(`🗑️ User confirmed - Deleting ${contactsToDelete.length} contact(s)...`);
        
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
                <div className="result-card success">
                  <div className="result-label">Contacts créés</div>
                  <div className="result-value">{results.created}</div>
                </div>
              )}
              {results.deleted > 0 && (
                <div className="result-card danger">
                  <div className="result-label">Contacts supprimés</div>
                  <div className="result-value">{results.deleted}</div>
                </div>
              )}
              <div className="result-card">
                <div className="result-label">Unfollowers</div>
                <div className="result-value">{results.unfollowers}</div>
              </div>
              <div className="result-card">
                <div className="result-label">Fans</div>
                <div className="result-value">{results.fans}</div>
              </div>
              <div className="result-card">
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
