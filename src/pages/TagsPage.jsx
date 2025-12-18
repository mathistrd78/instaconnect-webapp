import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import '../styles/Tags.css';

const TagsPage = () => {
  const navigate = useNavigate();
  const { defaultFields, customTags, setCustomTags, saveContacts } = useApp();
  const [selectedField, setSelectedField] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newEmoji, setNewEmoji] = useState('');

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

  const handleAddTag = () => {
    if (!newTag || !selectedField) return;

    const tagValue = newEmoji ? `${newEmoji} ${newTag}` : newTag;
    const newTagObj = {
      value: newTag,
      label: tagValue,
      class: `tag-${newTag.toLowerCase().replace(/\s+/g, '-')}`
    };

    const updatedTags = {
      ...customTags,
      [selectedField]: [...(customTags[selectedField] || []), newTagObj]
    };

    setCustomTags(updatedTags);
    saveContacts(null, true);

    setNewTag('');
    setNewEmoji('');
  };

  const handleDeleteTag = (fieldId, tagValue) => {
    if (window.confirm('Supprimer ce tag ?')) {
      const updatedTags = {
        ...customTags,
        [fieldId]: customTags[fieldId].filter(t => t.value !== tagValue)
      };
      setCustomTags(updatedTags);
      saveContacts(null, true);
    }
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
  const defaultTags = selectedFieldData?.tags || [];
  const customFieldTags = customTags[selectedField] || [];

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
              const customCount = customTags[field.id]?.length || 0;
              const defaultCount = field.tags?.length || 0;
              const totalCount = defaultCount + customCount;

              return (
                <button
                  key={field.id}
                  className={`field-item ${selectedField === field.id ? 'active' : ''}`}
                  onClick={() => setSelectedField(field.id)}
                >
                  <span className="field-icon">{getFieldIcon(field.id)}</span>
                  <span className="field-label">{field.label}</span>
                  <span className="field-count">{totalCount}</span>
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

                {/* Default Tags */}
                {defaultTags.length > 0 && (
                  <div className="tags-list">
                    <h3>Tags par défaut</h3>
                    <div className="tags-grid">
                      {defaultTags.map((tag, index) => (
                        <div key={index} className="tag-card">
                          <span className="tag-display">{tag.label || tag.value || tag}</span>
                          <span className="tag-default-badge">Par défaut</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Tags */}
                {customFieldTags.length > 0 ? (
                  <div className="tags-list">
                    <h3>Tags personnalisés</h3>
                    <div className="tags-grid">
                      {customFieldTags.map((tag, index) => (
                        <div key={index} className="tag-card">
                          <span className="tag-display">{tag.label}</span>
                          <button
                            className="tag-delete-btn"
                            onClick={() => handleDeleteTag(selectedField, tag.value)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="no-tags">
                    Aucun tag personnalisé pour ce champ
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
