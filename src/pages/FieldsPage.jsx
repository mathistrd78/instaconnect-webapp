import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import '../styles/Fields.css';

const FieldsPage = () => {
  const navigate = useNavigate();
  const { customFields, setCustomFields, defaultFields, saveContacts } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddField = () => {
    if (!newField.label) return;

    const field = {
      id: `custom_${Date.now()}`,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      order: customFields.length + 100
    };

    setCustomFields([...customFields, field]);
    saveContacts(null, true);

    setNewField({ label: '', type: 'text', required: false });
    setShowForm(false);
  };

  const handleDeleteField = (fieldId) => {
    if (window.confirm('Supprimer ce champ ?')) {
      setCustomFields(customFields.filter(f => f.id !== fieldId));
      saveContacts(null, true);
    }
  };

  const getFieldIcon = (type) => {
    switch (type) {
      case 'text': return '📝';
      case 'textarea': return '📄';
      case 'select': return '📋';
      case 'radio': return '⚪';
      case 'checkbox': return '☑️';
      case 'date': return '📅';
      default: return '📝';
    }
  };

  const getFieldTypeName = (type) => {
    switch (type) {
      case 'text': return 'Texte';
      case 'textarea': return 'Zone de texte';
      case 'select': return 'Liste déroulante';
      case 'radio': return 'Boutons radio';
      case 'checkbox': return 'Case à cocher';
      case 'date': return 'Date';
      default: return type;
    }
  };

  return (
    <div className="fields-page">
      <button className="back-button" onClick={() => navigate('/app/parametres')}>
        ← Retour aux paramètres
      </button>

      <div className="fields-header">
        <div>
          <h1>🏷️ Gestion des champs</h1>
          <p className="fields-subtitle">
            Personnalisez les champs de vos contacts
          </p>
        </div>
        <button className="btn-add-field" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Annuler' : '+ Ajouter un champ'}
        </button>
      </div>

      {showForm && (
        <div className="add-field-form">
          <h3>Nouveau champ personnalisé</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nom du champ</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                placeholder="Ex: Téléphone"
              />
            </div>
            <div className="form-group">
              <label>Type de champ</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              >
                <option value="text">Texte</option>
                <option value="textarea">Zone de texte</option>
                <option value="select">Liste déroulante</option>
                <option value="radio">Boutons radio</option>
                <option value="checkbox">Case à cocher</option>
                <option value="date">Date</option>
              </select>
            </div>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
            />
            Champ obligatoire
          </label>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowForm(false)}>
              Annuler
            </button>
            <button className="btn-save" onClick={handleAddField}>
              Créer le champ
            </button>
          </div>
        </div>
      )}

      <div className="fields-container">
        {/* Default Fields */}
        <div className="fields-section">
          <h2>Champs par défaut</h2>
          <div className="fields-list">
            {defaultFields.map(field => (
              <div key={field.id} className="field-card">
                <div className="field-info">
                  <div className="field-icon">{getFieldIcon(field.type)}</div>
                  <div className="field-details">
                    <div className="field-label">{field.label}</div>
                    <div className="field-type">{getFieldTypeName(field.type)}</div>
                  </div>
                </div>
                <div className="field-badges">
                  {field.required && <span className="badge-required">Requis</span>}
                  <span className="badge-default">Par défaut</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Fields */}
        {customFields.length > 0 && (
          <div className="fields-section">
            <h2>Champs personnalisés</h2>
            <div className="fields-list">
              {customFields.map(field => (
                <div key={field.id} className="field-card">
                  <div className="field-info">
                    <div className="field-icon">{getFieldIcon(field.type)}</div>
                    <div className="field-details">
                      <div className="field-label">{field.label}</div>
                      <div className="field-type">{getFieldTypeName(field.type)}</div>
                    </div>
                  </div>
                  <div className="field-actions">
                    {field.required && <span className="badge-required">Requis</span>}
                    <button
                      className="btn-delete-field"
                      onClick={() => handleDeleteField(field.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldsPage;
