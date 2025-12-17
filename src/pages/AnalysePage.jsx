import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/Analyse.css';

const AnalysePage = () => {
  const { addContact } = useApp();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
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
    
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
      
      // Extract followers and following
      let followersData = [];
      let followingData = [];
      
      const followersFile = zip.file(/followers_\d+\.json/)[0] || zip.file('followers_and_following/followers.json');
      const followingFile = zip.file(/following\.json/)[0] || zip.file('followers_and_following/following.json');
      
      if (followersFile) {
        const content = await followersFile.async('text');
        const parsed = JSON.parse(content);
        followersData = parsed.relationships_followers || parsed;
      }
      
      if (followingFile) {
        const content = await followingFile.async('text');
        const parsed = JSON.parse(content);
        followingData = parsed.relationships_following || parsed;
      }
      
      // Extract usernames
      const followers = followersData.map(item => 
        item.string_list_data?.[0]?.value || item.username || item
      );
      const following = followingData.map(item =>
        item.string_list_data?.[0]?.value || item.username || item
      );
      
      // Find mutual followers
      const mutualFollowers = followers.filter(f => following.includes(f));
      
      // Find unfollowers (you follow them but they don't follow you back)
      const unfollowers = following.filter(f => !followers.includes(f));
      
      // Find fans (they follow you but you don't follow them back)
      const fans = followers.filter(f => !following.includes(f));
      
      setResults({
        totalFollowers: followers.length,
        totalFollowing: following.length,
        mutualFollowers: mutualFollowers.length,
        unfollowers: unfollowers.length,
        fans: fans.length,
        mutualList: mutualFollowers
      });
      
      // Auto-create contacts for mutual followers
      let createdCount = 0;
      for (const username of mutualFollowers) {
        try {
          await addContact({
            instagram: username,
            firstName: username,
            createdAt: new Date().toISOString(),
            relationType: 'Ami',
            meetingPlace: 'Insta',
            discussionStatus: 'Jamais parlé'
          });
          createdCount++;
        } catch (error) {
          console.log(`Contact ${username} déjà existant ou erreur`);
        }
      }
      
      setResults(prev => ({...prev, createdContacts: createdCount}));
      
    } catch (error) {
      console.error('Erreur analyse:', error);
      alert('Erreur lors de l\'analyse du fichier. Vérifiez qu\'il s\'agit bien d\'un export Instagram.');
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
              <div className="upload-subtext">Fichier sélectionné</div>
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

        {/* Results */}
        {results && (
          <div className="analyse-results">
            <h3>✅ Analyse terminée !</h3>
            <div className="results-stats">
              <div className="stat-item">
                <span className="stat-label">Followers</span>
                <span className="stat-value">{results.totalFollowers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Following</span>
                <span className="stat-value">{results.totalFollowing}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mutuels</span>
                <span className="stat-value">{results.mutualFollowers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Unfollowers</span>
                <span className="stat-value">{results.unfollowers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Fans</span>
                <span className="stat-value">{results.fans}</span>
              </div>
            </div>
            
            {results.createdContacts > 0 && (
              <div className="success-message">
                🎉 {results.createdContacts} contacts créés automatiquement !
              </div>
            )}
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
