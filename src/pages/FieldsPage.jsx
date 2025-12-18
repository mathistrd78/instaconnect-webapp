import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import '../styles/Fields.css';

const FieldsPage = () => {
  const navigate = useNavigate();
  const { customFields, setCustomFields, saveContacts } = useApp();
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ... reste du code identique ...

  return (
    <div className="fields-page">
      {/* Back button */}
      <button className="back-button" onClick={() => navigate('/app/parametres')}>
        ← Retour aux paramètres
      </button>

      <div className="fields-header">
        <h1>🏷️ Gestion des champs</h1>
        <p className="fields-subtitle">
          Personnalisez les champs de vos contacts
        </p>
      </div>

      {/* ... reste du code identique ... */}
    </div>
  );
};

export default FieldsPage;
