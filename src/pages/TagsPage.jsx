import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useApp } from '../contexts/AppContext';
import '../styles/Tags.css';

const TagsPage = () => {
  const navigate = useNavigate();
  const { defaultFields, customTags, setCustomTags, saveContacts } = useApp();
  const [selectedField, setSelectedField] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [newColor, setNewColor] = useState('#E1306C');

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
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

    const updatedTags = {
      ...customTags,
      [selectedField]: [...(customTags[selectedField] || []), newTagObj]
    };

    setCustomTags(updatedTags);
    
    // Save with explicit metadata
    await saveContacts(null, true, {
      customTags: updatedTags,
      customFields: [],
      defaultFields
    });

    setNewTag('');
    setNewEmoji('');
    setNewColor('#E1306C');
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
        <h1>🏷️ Gestion des tags</h1>
        <p className="tags-subtitle">
          Personnalisez vos étiquettes et catégories
        </p>
      </div>

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

                {/* Add Tag Form */}
                <div className="add-tag-form">
                  <input
                    type="text"
                    className="emoji-input"
                    value={newEmoji}
                    onChange={(e) => setNewEmoji(e.target.value)}
                    placeholder="😀"
                    maxLength={2}
                  />
                  <input
                    type="color"
                    className="color-input"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    title="Choisir une couleur"
                  />
                  <input
                    type="text"
                    className="tag-label-input"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nom du tag"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <button className="btn-add-tag" onClick={handleAddTag}>
                    + Ajouter
                  </button>
                </div>

                {/* All Tags with Drag & Drop */}
                {allTags.length > 0 ? (
                  <div className="tags-list">
                    <h3>Tous les tags</h3>
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
                                    <button
                                      className="tag-delete-btn"
                                      onClick={() => handleDeleteTag(selectedField, tag.value)}
                                    >
                                      ✕
                                    </button>
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
