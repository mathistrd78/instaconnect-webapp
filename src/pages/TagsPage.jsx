import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/Tags.css';

const TagsPage = () => {
  const { defaultFields, customTags, setCustomTags, saveContacts } = useApp();
  const [selectedField, setSelectedField] = useState('relationType');
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagEmoji, setNewTagEmoji] = useState('🏷️');

  // Get field with tags
  const tagFields = defaultFields.filter(f => f.type === 'select');

  const currentField = tagFields.find(f => f.id === selectedField);
  const currentTags = currentField?.tags || [];

  const handleAddTag = async () => {
    if (!newTagLabel.trim()) {
      alert('Veuillez entrer un label pour le tag');
      return;
    }

    const newTag = {
      value: newTagLabel,
      label: `${newTagEmoji} ${newTagLabel}`,
      class: `tag-${newTagLabel.toLowerCase().replace(/\s+/g, '-')}`
    };

    const updatedCustomTags = {
      ...customTags,
      [selectedField]: [...(customTags[selectedField] || []), newTag]
    };

    setCustomTags(updatedCustomTags);
    await saveContacts(null, true); // Save metadata

    setNewTagLabel('');
    setNewTagEmoji('🏷️');
  };

  const handleDeleteTag = async (tagValue) => {
    if (!window.confirm(`Supprimer le tag "${tagValue}" ?`)) return;

    const updatedCustomTags = {
      ...customTags,
      [selectedField]: (customTags[selectedField] || []).filter(t => t.value !== tagValue)
    };

    setCustomTags(updatedCustomTags);
    await saveContacts(null, true);
  };

  const isCustomTag = (tag) => {
    return (customTags[selectedField] || []).some(t => t.value === tag.value);
  };

  return (
    <div className="tags-page">
      <div className="tags-header">
        <h1>🏷️ Gestion des tags</h1>
        <p className="tags-subtitle">
          Personnalisez vos tags pour mieux organiser vos contacts
        </p>
      </div>

      <div className="tags-container">
        {/* Field Selector */}
        <div className="tags-sidebar">
          <h3>Champs avec tags</h3>
          <div className="field-list">
            {tagFields.map(field => (
              <button
                key={field.id}
                className={`field-item ${selectedField === field.id ? 'active' : ''}`}
                onClick={() => setSelectedField(field.id)}
              >
                <span className="field-icon">🏷️</span>
                <span className="field-label">{field.label}</span>
                <span className="field-count">{field.tags?.length || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags Management */}
        <div className="tags-content">
          <div className="tags-section">
            <h2>{currentField?.label}</h2>

            {/* Add New Tag */}
            <div className="add-tag-form">
              <input
                type="text"
                className="emoji-input"
                value={newTagEmoji}
                onChange={(e) => setNewTagEmoji(e.target.value)}
                placeholder="📌"
                maxLength="2"
              />
              <input
                type="text"
                className="tag-label-input"
                value={newTagLabel}
                onChange={(e) => setNewTagLabel(e.target.value)}
                placeholder="Nom du tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button className="btn-add-tag" onClick={handleAddTag}>
                ➕ Ajouter
              </button>
            </div>

            {/* Existing Tags */}
            <div className="tags-list">
              <h3>Tags existants</h3>
              {currentTags.length === 0 ? (
                <div className="no-tags">
                  <p>Aucun tag pour ce champ</p>
                </div>
              ) : (
                <div className="tags-grid">
                  {currentTags.map(tag => (
                    <div key={tag.value} className="tag-card">
                      <span className="tag-display">{tag.label}</span>
                      {isCustomTag(tag) && (
                        <button
                          className="tag-delete-btn"
                          onClick={() => handleDeleteTag(tag.value)}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      )}
                      {!isCustomTag(tag) && (
                        <span className="tag-default-badge">Par défaut</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;
