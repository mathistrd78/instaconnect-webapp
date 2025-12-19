import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../styles/Fields.css';

const FieldsPage = () => {
  const navigate = useNavigate();
  const { getAllFields, saveContacts } = useApp();
  const [fields, setFields] = useState([]);
  const [defaultFieldIds, setDefaultFieldIds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [newField, setNewField] = useState({
    label: '',
    type: 'text',
    required: false,
    options: []
  });
  const [optionInput, setOptionInput] = useState('');

  // List of default field IDs (hardcoded)
  const DEFAULT_FIELD_IDS = [
    'instagram',
    'firstName',
    'gender',
    'birthDate',
    'location',
    'relationType',
    'meetingPlace',
    'discussionStatus',
    'nextMeeting',
    'notes'
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    loadFields();
  }, []);

  const loadFields = () => {
    const allFields = getAllFields();
    setFields(allFields);
    
    // Identify default fields
    const defaultIds = allFields
      .filter(f => DEFAULT_FIELD_IDS.includes(f.id))
      .map(f => f.id);
    setDefaultFieldIds(defaultIds);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(fields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property for all fields
    const reorderedFields = items.map((field, index) => ({
      ...field,
      order: index
    }));

    // Update local state immediately
    setFields(reorderedFields);

    // Separate default and custom fields
    const defaultFields = reorderedFields.filter(f => 
      DEFAULT_FIELD_IDS.includes(f.id)
    );
    const customFields = reorderedFields.filter(f => 
      !DEFAULT_FIELD_IDS.includes(f.id)
    );

    // Prepare metadata with explicit structure
    const explicitMetadata = {
      defaultFields: defaultFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      })),
      customFields: customFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      }))
    };

    // Save to Firebase with explicit metadata
    await saveContacts(null, true, explicitMetadata);
    
    console.log('✅ Field order saved to Firebase');
  };

  const handleAddField = async () => {
    if (!newField.label.trim()) {
      alert('Le nom du champ est requis');
      return;
    }

    // Validate options for select/radio
    if ((newField.type === 'select' || newField.type === 'radio') && newField.options.length === 0) {
      alert('Veuillez ajouter au moins une option');
      return;
    }

    // Find highest order number
    const maxOrder = Math.max(...fields.map(f => f.order || 0), -1);

    const fieldToAdd = {
      id: `custom_${Date.now()}`,
      type: newField.type,
      label: newField.label,
      required: newField.required,
      order: maxOrder + 1,
      ...(newField.options.length > 0 && { options: newField.options })
    };

    const updatedCustomFields = [...fields.filter(f => !DEFAULT_FIELD_IDS.includes(f.id)), fieldToAdd];
    const defaultFields = fields.filter(f => DEFAULT_FIELD_IDS.includes(f.id));

    const explicitMetadata = {
      defaultFields: defaultFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      })),
      customFields: updatedCustomFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      }))
    };

    await saveContacts(null, true, explicitMetadata);

    // Reset form
    setNewField({
      label: '',
      type: 'text',
      required: false,
      options: []
    });
    setOptionInput('');
    setShowForm(false);

    // Reload fields
    loadFields();
  };

  const handleEditField = async () => {
    if (!editingField.label.trim()) {
      alert('Le nom du champ est requis');
      return;
    }

    // Validate options for select/radio
    if ((editingField.type === 'select' || editingField.type === 'radio') && editingField.options.length === 0) {
      alert('Veuillez ajouter au moins une option');
      return;
    }

    const updatedFields = fields.map(f => 
      f.id === editingField.id ? editingField : f
    );

    const defaultFields = updatedFields.filter(f => DEFAULT_FIELD_IDS.includes(f.id));
    const customFields = updatedFields.filter(f => !DEFAULT_FIELD_IDS.includes(f.id));

    const explicitMetadata = {
      defaultFields: defaultFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      })),
      customFields: customFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      }))
    };

    await saveContacts(null, true, explicitMetadata);

    setEditingField(null);
    loadFields();
  };

  const handleDeleteField = async (fieldId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce champ ?')) {
      return;
    }

    const updatedFields = fields.filter(f => f.id !== fieldId);
    const defaultFields = updatedFields.filter(f => DEFAULT_FIELD_IDS.includes(f.id));
    const customFields = updatedFields.filter(f => !DEFAULT_FIELD_IDS.includes(f.id));

    const explicitMetadata = {
      defaultFields: defaultFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      })),
      customFields: customFields.map(f => ({
        id: f.id,
        type: f.type,
        label: f.label,
        required: f.required,
        order: f.order,
        ...(f.options && { options: f.options }),
        ...(f.tags && { tags: f.tags })
      }))
    };

    await saveContacts(null, true, explicitMetadata);

    loadFields();
  };

  const handleAddOption = (isEditing = false) => {
    if (!optionInput.trim()) return;

    if (isEditing) {
      setEditingField({
        ...editingField,
        options: [...(editingField.options || []), optionInput.trim()]
      });
    } else {
      setNewField({
        ...newField,
        options: [...newField.options, optionInput.trim()]
      });
    }
    setOptionInput('');
  };

  const handleRemoveOption = (index, isEditing = false) => {
    if (isEditing) {
      setEditingField({
        ...editingField,
        options: editingField.options.filter((_, i) => i !== index)
      });
    } else {
      setNewField({
        ...newField,
        options: newField.options.filter((_, i) => i !== index)
      });
    }
  };

  const startEdit = (field) => {
    setEditingField({ ...field });
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingField(null);
    setOptionInput('');
  };

  const isDefaultField = (fieldId) => {
    return DEFAULT_FIELD_IDS.includes(fieldId);
  };

  return (
    <div className="fields-page">
      <div className="fields-header">
        <h1>⚙️ Gestion des champs</h1>
        <p className="fields-subtitle">Personnalisez les champs de vos contacts</p>
      </div>

      {/* Edit Form */}
      {editingField && (
        <div className="field-form">
          <h2>✏️ Modifier le champ</h2>
          
          <div className="form-group">
            <label>Nom du champ</label>
            <input
              type="text"
              value={editingField.label}
              onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
              placeholder="Ex: Téléphone"
              className="form-input"
            />
          </div>

          {(editingField.type === 'select' || editingField.type === 'radio') && (
            <div className="form-group">
              <label>Options</label>
              <div className="options-input">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption(true))}
                  placeholder="Ajouter une option"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption(true)}
                  className="btn-add-option"
                >
                  +
                </button>
              </div>
              <div className="options-list">
                {editingField.options && editingField.options.map((option, index) => (
                  <div key={index} className="option-item">
                    <span>{option}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index, true)}
                      className="btn-remove-option"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={editingField.required}
                onChange={(e) => setEditingField({ ...editingField, required: e.target.checked })}
              />
              <span>Champ obligatoire</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={cancelEdit} className="btn-cancel">
              Annuler
            </button>
            <button type="button" onClick={handleEditField} className="btn-save">
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && !editingField && (
        <div className="field-form">
          <h2>➕ Ajouter un champ</h2>
          
          <div className="form-group">
            <label>Nom du champ</label>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              placeholder="Ex: Téléphone"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Type de champ</label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value, options: [] })}
              className="form-input"
            >
              <option value="text">Texte</option>
              <option value="textarea">Zone de texte</option>
              <option value="select">Liste déroulante</option>
              <option value="radio">Choix unique</option>
              <option value="checkbox">Case à cocher</option>
              <option value="date">Date</option>
            </select>
          </div>

          {(newField.type === 'select' || newField.type === 'radio') && (
            <div className="form-group">
              <label>Options</label>
              <div className="options-input">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                  placeholder="Ajouter une option"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => handleAddOption()}
                  className="btn-add-option"
                >
                  +
                </button>
              </div>
              <div className="options-list">
                {newField.options.map((option, index) => (
                  <div key={index} className="option-item">
                    <span>{option}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="btn-remove-option"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              />
              <span>Champ obligatoire</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
              Annuler
            </button>
            <button type="button" onClick={handleAddField} className="btn-save">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!showForm && !editingField && (
        <button className="btn-add-field" onClick={() => { setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          + Ajouter un champ
        </button>
      )}

      {/* Fields List */}
      <div className="fields-section">
        <h2>Liste des champs</h2>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="fields">
            {(provided) => (
              <div
                className="fields-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {fields.map((field, index) => (
                  <Draggable key={field.id} draggableId={field.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`field-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <div className="field-drag-handle" {...provided.dragHandleProps}>
                          ⋮⋮
                        </div>
                        <div className="field-info">
                          <div className="field-name">{field.label}</div>
                          <div className="field-type">{field.type}</div>
                        </div>
                        <div className="field-actions">
                          {!isDefaultField(field.id) && (
                            <>
                              <button
                                className="btn-edit"
                                onClick={() => startEdit(field)}
                                title="Modifier"
                              >
                                ✏️
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteField(field.id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                          {field.required && (
                            <span className="badge badge-required">Obligatoire</span>
                          )}
                          <span className={`badge ${isDefaultField(field.id) ? 'badge-default' : 'badge-custom'}`}>
                            {isDefaultField(field.id) ? 'Par défaut' : 'Personnalisé'}
                          </span>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default FieldsPage;
