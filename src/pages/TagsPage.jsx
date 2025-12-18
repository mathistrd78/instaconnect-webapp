import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import '../styles/Tags.css';

const TagsPage = () => {
  const navigate = useNavigate();
  const { defaultFields, customTags, setCustomTags, saveContacts } = useApp();
  const [selectedField, setSelectedField] = useState('');
  const [newTag, setNewTag] = useState('');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ... reste du code identique ...

  return (
    <div className="tags-page">
      {/* Back button */}
      <button className="back-button" onClick={() => navigate('/app/parametres')}>
        ← Retour aux paramètres
      </button>

      <div className="tags-header">
        <h1>🏷️ Gestion des tags</h1>
        <p className="tags-subtitle">
          Personnalisez vos étiquettes et catégories
        </p>
      </div>

      {/* ... reste du code identique ... */}
    </div>
  );
};

export default TagsPage;
