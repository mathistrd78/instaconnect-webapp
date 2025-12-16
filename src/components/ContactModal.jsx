import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/ContactModal.css';

const ContactModal = ({ contact, onClose }) => {
  const { addContact, updateContact, getAllFields } = useApp();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      // FIX: Convertir l'ancien format location (objet) vers le nouveau (string)
      const cleanedContact = { ...contact };
      if (cleanedContact.location && typeof cleanedContact.location === 'object') {
        cleanedContact.location = cleanedContact.location.displayName || 
                                   cleanedContact.location.city || 
                                   '';
      }
      setFormData(cleanedContact);
    } else {
      setFormData({});
    }
  }, [contact]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate required fields
    const allFields = getAllFields();
    const missingRequired = allFields
      .filter(f => f.required)
      .find(f => !formData[f.id] || formData[f.id] === '');

    if (missingRequired) {
      alert(`Le champ "${missingRequired.label}" est requis`);
      setLoading(false);
      return;
    }

    try {
      if (contact) {
        // Update existing contact
        await updateContact(contact.id, formData);
      } else {
        // Add new contact
        await addContact(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            className="form-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.label}
          />
        );

      case 'select':
        return (
          <select
            className="form-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {field.tags?.map(tag => (
              <option key={tag.value} value={tag.value}>
                {tag.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map(option => (
              <label key={option} className="radio-label">
                <input
                  type="radio"
                  name={field.id}
                  checked={formData[field.id] === option}
                  onChange={() => handleChange(field.id, option)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'textarea':
        return (
          <textarea
            className="form-textarea"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.label}
            rows={4}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            className="form-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            min={field.futureOnly ? new Date().toISOString().split('T')[0] : undefined}
          />
        );

      case 'year':
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
        return (
          <select
            className="form-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
          >
            <option value="">Sélectionner...</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        );

      case 'city':
        // FIX: Gérer l'ancien format objet et le nouveau format string
        const locationValue = formData[field.id];
        let displayValue = '';
        
        if (typeof locationValue === 'object' && locationValue !== null) {
          displayValue = locationValue.displayName || 
                        locationValue.city || 
                        '';
        } else if (typeof locationValue === 'string') {
          displayValue = locationValue;
        }
        
        return (
          <input
            type="text"
            className="form-input"
            value={displayValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder="Ville"
          />
        );

      default:
        return (
          <input
            type="text"
            className="form-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.label}
          />
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contact ? '✏️ Modifier le contact' : '➕ Nouveau contact'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-content" onSubmit={handleSubmit}>
          {/* Instagram Handle (required) */}
          <div className="form-group">
            <label className="form-label">
              Instagram <span className="required">*</span>
            </label>
            <div className="instagram-input-container">
              <span className="instagram-prefix">@</span>
              <input
                type="text"
                className="form-input instagram-input"
                value={formData.instagram || ''}
                onChange={(e) => handleChange('instagram', e.target.value)}
                placeholder="username"
                required
              />
            </div>
          </div>

          {/* First Name (required) */}
          <div className="form-group">
            <label className="form-label">
              Prénom <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.firstName || ''}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Prénom"
              required
            />
          </div>

          {/* Dynamic Fields */}
          {getAllFields().map(field => (
            <div key={field.id} className="form-group">
              <label className="form-label">
                {field.label}
                {field.required && <span className="required"> *</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          {/* Submit Button */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : contact ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
