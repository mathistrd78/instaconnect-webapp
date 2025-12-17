import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/ContactModal.css';

const ContactModal = ({ contact, onClose }) => {
  const { addContact, updateContact, deleteContact, getAllFields, customTags } = useApp();
  const [formData, setFormData] = useState({
    firstName: '',
    instagram: '',
    notes: '',
    location: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    isFavorite: false,
    ...contact
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      // Parse existing birthDate if present
      if (contact.birthDate) {
        const date = new Date(contact.birthDate);
        setFormData(prev => ({
          ...prev,
          birthDay: date.getDate().toString(),
          birthMonth: (date.getMonth() + 1).toString(),
          birthYear: date.getFullYear().toString()
        }));
      }

      // Handle location object
      if (contact.location && typeof contact.location === 'object') {
        setFormData(prev => ({
          ...prev,
          location: contact.location.displayName || 
                   `${contact.location.city || ''}, ${contact.location.country || ''}`.trim()
        }));
      }
    }
  }, [contact]);

  const allFields = getAllFields();

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error for this field
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    allFields.forEach(field => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} est requis`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Build birthDate from day/month/year if at least one is present
    let birthDate = null;
    if (formData.birthYear || formData.birthMonth || formData.birthDay) {
      const year = formData.birthYear || '2000';
      const month = formData.birthMonth || '1';
      const day = formData.birthDay || '1';
      birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toISOString();
    }

    const dataToSave = {
      ...formData,
      birthDate,
      location: formData.location || null,
      updatedAt: new Date().toISOString()
    };

    // Remove temporary fields
    delete dataToSave.birthDay;
    delete dataToSave.birthMonth;
    delete dataToSave.birthYear;

    if (contact?.id) {
      await updateContact(contact.id, dataToSave);
    } else {
      await addContact({
        ...dataToSave,
        createdAt: new Date().toISOString()
      });
    }
    
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm(`Supprimer ${formData.firstName || 'ce contact'} ?`)) {
      await deleteContact(contact.id);
      onClose();
    }
  };

  const getFieldOptions = (field) => {
    // Get custom tags for this field
    const customFieldTags = customTags[field.id] || [];
    
    // For radio fields, use options
    if (field.type === 'radio' && field.options) {
      const allOptions = [...field.options, ...customFieldTags.map(t => t.value || t)];
      // Remove duplicates
      return [...new Set(allOptions)];
    }
    
    // For select fields, use tags
    const allTags = [...(field.tags || []), ...customFieldTags];
    
    // Remove duplicates based on value
    const uniqueTags = [];
    const seenValues = new Set();
    
    allTags.forEach(tag => {
      const value = tag.value || tag;
      if (!seenValues.has(value)) {
        seenValues.add(value);
        uniqueTags.push(tag);
      }
    });
    
    return uniqueTags;
  };

  const renderField = (field) => {
    const value = formData[field.id] || '';
    const hasError = errors[field.id];
    const options = getFieldOptions(field);

    // Special handling for firstName and instagram - swap order
    if (field.id === 'firstName') {
      return (
        <div key={field.id} className={`form-group ${hasError ? 'error' : ''}`}>
          <label className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            type="text"
            className="form-input"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.label}
          />
          {hasError && <span className="error-message">{hasError}</span>}
        </div>
      );
    }

    if (field.id === 'instagram') {
      return (
        <div key={field.id} className={`form-group ${hasError ? 'error' : ''}`}>
          <label className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <input
            type="text"
            className="form-input"
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.label}
          />
          {hasError && <span className="error-message">{hasError}</span>}
        </div>
      );
    }

    // Special handling for birthDate - 3 separate selects
    if (field.id === 'birthDate') {
      const days = Array.from({ length: 31 }, (_, i) => i + 1);
      const months = [
        { value: '1', label: 'Janvier' },
        { value: '2', label: 'Février' },
        { value: '3', label: 'Mars' },
        { value: '4', label: 'Avril' },
        { value: '5', label: 'Mai' },
        { value: '6', label: 'Juin' },
        { value: '7', label: 'Juillet' },
        { value: '8', label: 'Août' },
        { value: '9', label: 'Septembre' },
        { value: '10', label: 'Octobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Décembre' }
      ];
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

      return (
        <div key={field.id} className="form-group">
          <label className="form-label">
            {field.label}
            {field.required && <span className="required">*</span>}
          </label>
          <div className="birth-date-container">
            <select
              className="form-select birth-select"
              value={formData.birthDay || ''}
              onChange={(e) => handleChange('birthDay', e.target.value)}
            >
              <option value="">Jour</option>
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            <select
              className="form-select birth-select"
              value={formData.birthMonth || ''}
              onChange={(e) => handleChange('birthMonth', e.target.value)}
            >
              <option value="">Mois</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
            <select
              className="form-select birth-select"
              value={formData.birthYear || ''}
              onChange={(e) => handleChange('birthYear', e.target.value)}
            >
              <option value="">Année</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          {hasError && <span className="error-message">{hasError}</span>}
        </div>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className={`form-group ${hasError ? 'error' : ''}`}>
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              className="form-input"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.label}
            />
            {hasError && <span className="error-message">{hasError}</span>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className={`form-group ${hasError ? 'error' : ''}`}>
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              className="form-textarea"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
              placeholder={field.label}
              rows={4}
            />
            {hasError && <span className="error-message">{hasError}</span>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className={`form-group ${hasError ? 'error' : ''}`}>
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              className="form-select"
              value={value}
              onChange={(e) => handleChange(field.id, e.target.value)}
            >
              <option value="">Sélectionner...</option>
              {options.map(option => {
                const optionValue = option.value || option;
                const optionLabel = option.label || option;
                return (
                  <option key={optionValue} value={optionValue}>
                    {optionLabel}
                  </option>
                );
              })}
            </select>
            {hasError && <span className="error-message">{hasError}</span>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className={`form-group ${hasError ? 'error' : ''}`}>
            <label className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <div className="radio-group">
              {options.map(option => (
                <label key={option} className="radio-label">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {hasError && <span className="error-message">{hasError}</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!!value}
                onChange={(e) => handleChange(field.id, e.target.checked)}
              />
              <span>{field.label}</span>
            </label>
          </div>
        );

      default:
        return null;
    }
  };

  // Reorder fields: firstName first, instagram second
  const reorderedFields = [...allFields].sort((a, b) => {
    if (a.id === 'firstName') return -1;
    if (b.id === 'firstName') return 1;
    if (a.id === 'instagram') return -1;
    if (b.id === 'instagram') return 1;
    return 0;
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contact ? 'Modifier le contact' : 'Nouveau contact'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {reorderedFields.map(field => renderField(field))}

          <div className="modal-actions">
            <button type="submit" className="btn-primary">
              {contact ? 'Modifier' : 'Créer'}
            </button>
            {contact && (
              <button 
                type="button" 
                className="btn-delete" 
                onClick={handleDelete}
              >
                🗑️ Supprimer
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
