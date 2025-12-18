import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../contexts/AppContext';
import '../styles/Fields.css';

const FieldsPage = () => {
  const navigate = useNavigate();
  const { customFields, setCustomFields, defaultFields, setDefaultFields, saveContacts, getAllFields, customTags } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    options: []
  });
  const [optionInput, setOptionInput] = useState('');
  const formRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Get all fields sorted by order
  const allFields = getAllFields();

  const handleAddField = async () => {
    if (!newField.label) return;

    let updatedDefaultFields = defaultFields;
    let updatedCustomFields = customFields;

    if (editingField) {
      // Update existing field
      if (editingField.isDefault) {
        // Update default field
        updatedDefaultFields = defaultFields.map(f =>
          f.id === editingField.id ? { ...f, ...newField } : f
        );
        setDefaultFields(updatedDefaultFields);
      } else {
        // Update custom field
        updatedCustomFields = customFields.map(f =>
          f.id === editingField.id ? { ...f, ...newField } : f
        );
        setCustomFields(updatedCustomFields);
      }
    } else {
      // Create new field
      const field = {
        id: `custom_${Date.now()}`,
        label: newField.label,
        type: newField.type,
        required: newField.required,
        options: newField.options,
        order: allFields.length
      };
      updatedCustomFields = [...customFields, field];
      setCustomFields(updatedCustomFields);
    }

    // Wait for state update and save to Firebase
    setTimeout(async () => {
      await saveContacts(null, true);
      console.log('✅ Fields saved to Firebase');
    }, 100);

    setNewField({ label: '', type: 'text', required: false, options: [] });
    setShowForm(false);
    setEditingField(null);
  };

  const handleEditField = (field) => {
    const isDefault = defaultFields.some(f => f.id === field.id);
    setEditingField({ ...field, isDefault });
    setNewField({
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options || []
    });
    setShowForm(true);
    
    // Scroll to top to show form
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteField = async (fieldId) => {
    if (window.confirm('Supprimer ce champ ?')) {
      const updatedCustomFields = customFields.filter(f => f.id !== fieldId);
      setCustomFields(updatedCustomFields);
      
      // Wait and save to Firebase
      setTimeout(async () => {
        await saveContacts(null, true);
        console.log('✅ Field deleted and saved to Firebase');
      }, 100);
    }
  };

  const handleAddOption = () => {
    if (!optionInput.trim()) return;
    setNewField({
      ...newField,
      options: [...(newField.options || []), optionInput.trim()]
    });
    setOptionInput('');
  };

  const handleRemoveOption = (index) => {
    setNewField({
      ...newField,
      options: newField.options.filter((_, i) => i !== index)
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(allFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for all fields
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    // Split back into default and custom
    const updatedDefaultFields = updatedItems.filter(f => 
      defaultFields.some(df => df.id === f.id)
    );
    const updatedCustomFields = updatedItems.filter(f => 
      customFields.some(cf => cf.id === f.id)
    );

    setDefaultFields(updatedDefaultFields);
    setCustomFields(updatedCustomFields);
    
    // Wait and save to Firebase
    setTimeout(async () => {
      await saveContacts(null, true);
      console.log('✅ Field order saved to Firebase');
    }, 100);
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

  const isDefaultField = (fieldId) => {
    return defaultFields.some(f => f.id === fieldId);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingField(null);
    setNewField({ label: '', type: 'text', required: false, options: [] });
    setOptionInput('');
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
        {!showForm && (
          <button className="btn-add-field" onClick={() => setShowForm(true)}>
            + Ajouter un champ
          </button>
        )}
      </div>

      {showForm && (
        <div className="add-field-form" ref={formRef}>
          <h3>{editingField ? 'Modifier le champ' : 'Nouveau champ personnalisé'}</h3>
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

          {/* Options for select/radio */}
          {(newField.type === 'select' || newField.type === 'radio') && (
            <div className="form-group">
              <label>Options</label>
              <div className="options-input">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  placeholder="Ajouter une option"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                />
                <button type="button" className="btn-add-option" onClick={handleAddOption}>
                  + Ajouter
                </button>
              </div>
              {newField.options && newField.options.length > 0 && (
                <div className="options-list">
                  {newField.options.map((option, index) => (
                    <div key={index} className="option-item">
                      <span>{option}</span>
                      <button
                        type="button"
                        className="btn-remove-option"
                        onClick={() => handleRemoveOption(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div 
            className="checkbox-label"
            onClick={() => setNewField({ ...newField, required: !newField.required })}
          >
            <input
              type="checkbox"
              checked={newField.required}
              onChange={() => {}}
              readOnly
            />
            Champ obligatoire
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={cancelForm}>
              Annuler
            </button>
            <button className="btn-save" onClick={handleAddField}>
              {editingField ? 'Modifier' : 'Créer le champ'}
            </button>
          </div>
        </div>
      )}

      <div className="fields-container">
        <div className="fields-section">
          <h2>Tous les champs</h2>
          <p className="fields-hint">Glissez-déposez pour réorganiser l'ordre</p>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="fields">
              {(provided) => (
                <div
                  className="fields-list"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {allFields.map((field, index) => {
                    const isDefault = isDefaultField(field.id);
                    return (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`field-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <div className="drag-handle">⋮⋮</div>
                            <div className="field-info">
                              <div className="field-icon">{getFieldIcon(field.type)}</div>
                              <div className="field-details">
                                <div className="field-label">{field.label}</div>
                                <div className="field-type">{getFieldTypeName(field.type)}</div>
                              </div>
                            </div>
                            <div className="field-actions">
                              {!isDefault && (
                                <>
                                  <button
                                    className="btn-edit-field"
                                    onClick={() => handleEditField(field)}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="btn-delete-field"
                                    onClick={() => handleDeleteField(field.id)}
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                              {field.required && <span className="badge-required">Requis</span>}
                              {isDefault ? (
                                <span className="badge-default">Par défaut</span>
                              ) : (
                                <span className="badge-custom">Personnalisé</span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default FieldsPage;
