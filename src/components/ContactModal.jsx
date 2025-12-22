import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ContactModal.css';

const ContactModal = ({ contact, onClose, onSave }) => {
  const { getAllFields } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const allFields = getAllFields();

  useEffect(() => {
    if (contact) {
      setFormData({ ...contact });

      // Parse birthDate
      if (contact.birthDate) {
        const date = new Date(contact.birthDate);
        if (!isNaN(date.getTime())) {
          setSelectedDay(String(date.getDate()).padStart(2, '0'));
          setSelectedMonth(String(date.getMonth() + 1).padStart(2, '0'));
          setSelectedYear(String(date.getFullYear()));
        }
      }
    }
  }, [contact]);

  // Update birthDate when selects change
  useEffect(() => {
    if (selectedDay && selectedMonth && selectedYear) {
      const dateStr = `${selectedYear}-${selectedMonth}-${selectedDay}`;
      setFormData(prev => ({ ...prev, birthDate: dateStr }));
    }
  }, [selectedDay, selectedMonth, selectedYear]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  // Generate day options
  const days = Array.from({ length: 31 }, (_, i) => {
    const day = String(i + 1).padStart(2, '0');
    return { value: day, label: day };
  });

  // Generate month options
  const months = [
    { value: '01', label: 'Janvier' },
    { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' },
    { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' },
    { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' },
    { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' },
    { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Décembre' }
  ];

  // Generate year options (current year ± 100 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 201 }, (_, i) => {
    const year = String(currentYear - 100 + i);
    return { value: year, label: year };
  });

  // Helper function to get display value for any field
  const getDisplayValue = (field) => {
    const value = formData[field.id];
    
    // Handle location field (can be object or string)
    if (field.id === 'location') {
      if (typeof value === 'object' && value !== null) {
        return value.displayName || value.city || '';
      }
      return value || '';
    }
    
    // Handle other fields normally
    return value || '';
  };

  const renderField = (field) => {
    // Instagram field is disabled
    const isDisabled = field.id === 'instagram';

    // Special case for location field - always render as text input
    if (field.id === 'location') {
      const displayValue = getDisplayValue(field);
      
      return (
        <input
          type="text"
          id={field.id}
          className="form-input"
          value={displayValue}
          onChange={(e) => handleChange(field.id, e.target.value)}
          required={field.required}
          placeholder="Ex: Paris, France"
        />
      );
    }

    switch (field.type) {
      case 'text':
        const displayValue = getDisplayValue(field);
        
        return (
          <input
            type="text"
            id={field.id}
            className={`form-input ${isDisabled ? 'disabled' : ''}`}
            value={displayValue}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            disabled={isDisabled}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={field.id}
            className="form-input"
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            required={field.required}
            rows={4}
          />
        );

      case 'select':
        const currentSelectValue = typeof formData[field.id] === 'number' 
          ? formData[field.id] 
          : (field.tags ? field.tags.findIndex(tag => (tag.value || tag) === formData[field.id]) : -1);

        // Check if tags are empty
        const hasTags = field.tags && field.tags.length > 0;

        return (
          <>
            {!hasTags && (
              <div style={{ 
                padding: '12px', 
                background: 'rgba(255, 193, 7, 0.1)', 
                borderRadius: '8px', 
                marginBottom: '8px',
                fontSize: '14px',
                color: '#f0ad4e'
              }}>
                ⚠️ Aucun tag disponible. 
                <span 
                  onClick={() => navigate('/app/tags')}
                  style={{ 
                    color: '#E1306C', 
                    cursor: 'pointer', 
                    textDecoration: 'underline',
                    marginLeft: '4px'
                  }}
                >
                  Créez vos tags sur la page Profil
                </span>
              </div>
            )}
            <select
              id={field.id}
              className="form-input"
              value={currentSelectValue >= 0 ? currentSelectValue : ''}
              onChange={(e) => handleChange(field.id, e.target.value === '' ? '' : parseInt(e.target.value))}
              required={field.required}
              disabled={!hasTags}
            >
              <option value="">Sélectionner</option>
              {field.tags && field.tags.map((tag, index) => (
                <option key={index} value={index}>
                  {tag.label || tag}
                </option>
              ))}
            </select>
          </>
        );

      case 'radio':
        const currentRadioValue = typeof formData[field.id] === 'number' 
          ? formData[field.id] 
          : (field.options ? field.options.findIndex(opt => opt === formData[field.id]) : -1);

        return (
          <div className="radio-group">
            {field.options && field.options.map((option, index) => (
              <label 
                key={index} 
                className="radio-label"
                onClick={() => handleChange(field.id, index)}
                style={{ cursor: 'pointer' }}
              >
                <input
                  type="radio"
                  name={field.id}
                  value={index}
                  checked={currentRadioValue === index}
                  onChange={() => {}}
                  required={field.required}
                  style={{ pointerEvents: 'none' }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData[field.id] || false}
              onChange={(e) => handleChange(field.id, e.target.checked)}
            />
            <span>{field.label}</span>
          </label>
        );

      case 'date':
        if (field.id === 'birthDate') {
          return (
            <div className="date-selects">
              <select
                className="form-input date-select"
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                required={field.required}
              >
                <option value="">Jour</option>
                {days.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
              <select
                className="form-input date-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required={field.required}
              >
                <option value="">Mois</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                className="form-input date-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                required={field.required}
              >
                <option value="">Année</option>
                {years.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
          );
        } else {
          return (
            <input
              type="date"
              id={field.id}
              className="form-input"
              value={formData[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              required={field.required}
            />
          );
        }

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{contact?.id ? 'Modifier le contact' : 'Nouveau contact'}</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {allFields.map(field => (
            <div key={field.id} className="form-group">
              <label htmlFor={field.id} className="form-label">
                {field.label}
                {field.required && <span className="required">*</span>}
              </label>
              {renderField(field)}
            </div>
          ))}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-save">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
