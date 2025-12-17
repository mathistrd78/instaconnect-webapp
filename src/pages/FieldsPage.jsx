import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/Fields.css';

const FieldsPage = () => {
  const { defaultFields, customFields, setCustomFields, saveContacts } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false
  });

  const fieldTypes = [
    { value: 'text', label: '📝 Texte' },
    { value: 'textarea', label: '📄 Texte long' },
    { value: 'select', label: '📋 Liste déroulante' },
    { value: 'radio', label: '⭕ Choix unique' },
    { value: 'checkbox', label: '☑️ Case à cocher' },
    { value: 'date', label: '📅 Date' },
    { value: 'number', label: '🔢 Nombre' }
  ];

  const handleAddField = async () => {
    if (!newField.label.trim()) {
      alert('Veuillez entrer un label pour le champ');
      return;
    }

    const fieldId = newField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    const field = {
      id: fieldId,
      label: newField.label,
      type: newField.type,
      required: newField.required,
      order: defaultFields.length + customFields.length,
      tags: newField.type === 'select' ? [] : undefined,
      options: (newField.type === 'radio' || newField.type === 'checkbox') ? [] : undefined
    };

    const updatedCustomFields = [...customFields, field];
    setCustomFields(updatedCustomFields);
    await saveContacts(null, true);

    setNewField({ label: '', type: 'text', required: false });
    setShowAddForm(false);
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Supprimer ce champ ? Les données des contacts seront perdues.')) return;

    const updatedCustomFields = customFields.filter(f => f.id !== fieldId);
    setCustomFields(updatedCustomFields);
    await saveContacts(null, true);
  };

  const allFields = [...defaultFields, ...customFields].sort((a, b) => a.order - b.order);

  return (
    <div className="fields-page">
      <div className="fields-header">
        <h1>📝 Gestion des champs</h1>
        <p className="fields-subtitle">
          Personnalisez les champs de vos contacts
        </p>
        <button 
          className="btn-add-field"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          ➕ Ajouter un champ
        </button>
      </div>

      {showAddForm && (
        <div className="add-field-form">
          <h3>Nouveau champ</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Label du champ</label>
              <input
                type="text"
                value={newField.label}
                onChange={(e) => setNewField({...newField, label: e.target.value})}
                placeholder="Ex: Numéro de téléphone"
              />
            </div>
            <div className="form-group">
              <label>Type de champ</label>
              <select
                value={newField.type}
                onChange={(e) => setNewField({...newField, type: e.target.value})}
              >
                {fieldTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({...newField, required: e.target.checked})}
              />
              <span>Champ obligatoire</span>
            </label>
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setShowAddForm(false)}>
              Annuler
            </button>
            <button className="btn-save" onClick={handleAddField}>
              Ajouter
            </button>
          </div>
        </div>
      )}

      <div className="fields-container">
        <div className="fields-section">
          <h2>Champs par défaut</h2>
          <div className="fields-list">
            {defaultFields.map(field => (
              <div key={field.id} className="field-card default">
                <div className="field-info">
                  <span className="field-icon">
                    {field.type === 'text' && '📝'}
                    {field.type === 'textarea' && '📄'}
                    {field.type === 'select' && '📋'}
                    {field.type === 'radio' && '⭕'}
                    {field.type === 'date' && '📅'}
                    {field.type === 'city' && '🌍'}
                    {field.type === 'year' && '📅'}
                  </span>
                  <div className="field-details">
                    <span className="field-label">{field.label}</span>
                    <span className="field-type">
                      {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                    </span>
                  </div>
                </div>
                <div className="field-badges">
                  {field.required && <span className="badge-required">Obligatoire</span>}
                  <span className="badge-default">Par défaut</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {customFields.length > 0 && (
          <div className="fields-section">
            <h2>Champs personnalisés</h2>
            <div className="fields-list">
              {customFields.map(field => (
                <div key={field.id} className="field-card custom">
                  <div className="field-info">
                    <span className="field-icon">
                      {field.type === 'text' && '📝'}
                      {field.type === 'textarea' && '📄'}
                      {field.type === 'select' && '📋'}
                      {field.type === 'radio' && '⭕'}
                      {field.type === 'checkbox' && '☑️'}
                      {field.type === 'date' && '📅'}
                      {field.type === 'number' && '🔢'}
                    </span>
                    <div className="field-details">
                      <span className="field-label">{field.label}</span>
                      <span className="field-type">
                        {fieldTypes.find(t => t.value === field.type)?.label || field.type}
                      </span>
                    </div>
                  </div>
                  <div className="field-actions">
                    {field.required && <span className="badge-required">Obligatoire</span>}
                    <button
                      className="btn-delete-field"
                      onClick={() => handleDeleteField(field.id)}
                      title="Supprimer"
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
