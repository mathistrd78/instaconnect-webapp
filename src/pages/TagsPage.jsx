import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EmojiPicker from 'emoji-picker-react';
import { useApp } from '../contexts/AppContext';
import '../styles/Tags.css';

const TagsPage = () => {
  const navigate = useNavigate();
  const { defaultFields, customTags, setCustomTags, saveContacts } = useApp();
  const [selectedField, setSelectedField] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newColor, setNewColor] = useState('#E1306C');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter fields that support tags (select type)
  const selectFields = defaultFields.filter(f => f.type === 'select');

  // Set first field as selected by default
  useEffect(() => {
    if (selectFields.length > 0 && !selectedField) {
      setSelectedField(selectFields[0].id);
    }
  }, [selectFields, selectedField]);

  const handleAddTag = async () => {
    if (!newTag || !selectedField) return;

    const tagValue = newEmoji ? `${newEmoji} ${newTag}` : newTag;
    const newTagObj = {
      value: newTag,
      label: tagValue,
      color: newColor,
      class: `tag-${newTag.toLowerCase().replace(/\s+/g, '-')}`
    };

    let updatedFieldTags;

    if (editingTag) {
      // Update existing tag
      updatedFieldTags = (customTags[selectedField] || []).map(t =>
        t.value === editingTag.value ? newTagObj : t
      );
    } else {
      // Add new tag
      updatedFieldTags = [...(customTags[selectedField] || []), newTagObj];
    }

    const updatedTags = {
      ...customTags,
      [selectedField]: updatedFieldTags
    };

    setCustomTags(updatedTags);
    
    // Save with explicit metadata
    await saveContacts(null, true, {
      customTags: updatedTags,
      customFields: [],
      defaultFields
    });

    // Reset form
    setNewTag('');
    setNewEmoji('');
    setNewColor('#E1306C');
    setShowForm(false);
    setEditingTag(null);
  };

  const handleEditTag = (tag) => {
    setEditingTag(tag);
    setNewTag(tag.value);
    setNewEmoji(tag.label.split(' ')[0] || '');
    setNewColor(tag.color || '#E1306C');
    setShowForm(true);

    // Scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteTag = async (fieldId, tagValue) => {
    if (window.confirm('Supprimer ce tag ?')) {
      const updatedTags = {
        ...customTags,
        [fieldId]: customTags[fieldId].filter(t => t.value !== tagValue)
      };
      setCustomTags(updatedTags);
      
      // Save with explicit metadata
      await saveContacts(null, true, {
        customTags: updatedTags,
        customFields: [],
        defaultFields
      });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(customTags[selectedField] || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedTags = {
      ...customTags,
      [selectedField]: items
    };

    setCustomTags(updatedTags);
    
    // Save with explicit metadata
    await saveContacts(null, true, {
      customTags: updatedTags,
      customFields: [],
      defaultFields
    });

    console.log('✅ Tag order saved');
  };

  const handleEmojiClick = (emojiData) => {
    setNewEmoji(emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTag(null);
    setNewTag('');
    setNewEmoji('');
    setNewColor('#E1306C');
  };

  const getFieldIcon = (fieldId) => {
    switch (fieldId) {
      case 'relationType': return '👥';
      case 'meetingPlace': return '📍';
      case 'discussionStatus': return '💬';
      default: return '🏷️';
    }
  };

  const selectedFieldData = selectFields.find(f => f.id === selectedField);
  const allTags = customTags[selectedField] || [];

  return (
    <div className="tags-page">
      <button className="back-button" onClick={() => navigate('/app/parametres')}>
        ← Retour aux paramètres
      </button>

      <div className="tags-header">
        <div>
          <h1>🏷️ Gestion des tags</h1>
          <p className="tags-subtitle">
            Personnalisez vos étiquettes et catégories
          </p>
        </div>
        {!showForm && (
          <button className="btn-add-tag-header" onClick={() => setShowForm(true)}>
            + Ajouter un tag
          </button>
        )}
      </div>

      {showForm && (
        <div className="add-tag-form-container">
          <h3>{editingTag ? 'Modifier le tag' : 'Nouveau tag'}</h3>
          <div className="add-tag-form">
            <div className="emoji-color-group">
              <div className="emoji-input-wrapper" ref={emojiPickerRef}>
                <input
                  type="text"
                  className="emoji-input"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="😀"
                  maxLength={2}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  readOnly
                />
                {showEmojiPicker && (
                  <div className="emoji-picker-container">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </div>
              <input
                type="color"
                className="color-input"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                title="Choisir une couleur"
              />
            </div>
            <input
              type="text"
              className="tag-label-input"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nom du tag"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
            />
            <div className="form-actions-inline">
              <button className="btn-cancel-tag" onClick={cancelForm}>
                Annuler
              </button>
              <button className="btn-save-tag" onClick={handleAddTag}>
                {editingTag ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tags-container">
        {/* Sidebar */}
        <div className="tags-sidebar">
          <h3>Champs</h3>
          <div className="field-list">
            {selectFields.map(field => {
              const tagCount = customTags[field.id]?.length || 0;

              return (
                <button
                  key={field.id}
                  className={`field-item ${selectedField === field.id ? 'active' : ''}`}
                  onClick={() => setSelectedField(field.id)}
                >
                  <span className="field-icon">{getFieldIcon(field.id)}</span>
                  <span className="field-label">{field.label}</span>
                  <span className="field-count">{tagCount}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="tags-content">
          {selectedFieldData ? (
            <>
              <div className="tags-section">
                <h2>{selectedFieldData.label}</h2>

                {/* All Tags with Drag & Drop */}
                {allTags.length > 0 ? (
                  <div className="tags-list">
                    <p className="tags-hint">Glissez-déposez pour réorganiser l'ordre</p>

                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="tags">
                        {(provided) => (
                          <div
                            className="tags-grid"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {allTags.map((tag, index) => (
                              <Draggable key={tag.value} draggableId={tag.value} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`tag-card ${snapshot.isDragging ? 'dragging' : ''}`}
                                  >
                                    <div className="drag-handle-tag">⋮⋮</div>
                                    <div
                                      className="tag-color-indicator"
                                      style={{ backgroundColor: tag.color || '#E1306C' }}
                                    ></div>
                                    <span className="tag-display">{tag.label}</span>
                                    <div className="tag-actions">
                                      <button
                                        className="tag-edit-btn"
                                        onClick={() => handleEditTag(tag)}
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        className="tag-delete-btn"
                                        onClick={() => handleDeleteTag(selectedField, tag.value)}
                                      >
                                        🗑️
                                      </button>
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
                ) : (
                  <div className="no-tags">
                    Aucun tag pour ce champ. Créez-en un !
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-tags">
              Sélectionnez un champ pour gérer ses tags
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
