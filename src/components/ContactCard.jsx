import React from 'react';
import { useApp } from '../contexts/AppContext';
import { cityAutocomplete } from '../utils/cityAutocomplete';
import '../styles/ContactCard.css';

const ContactCard = ({ contact, onEdit }) => {
  const { updateContact, getAllFields } = useApp();
  
  const allFields = getAllFields();

  // Helper function to get display value for radio/select fields
  const getFieldDisplayValue = (field, value) => {
    if (value === undefined || value === '' || value === null) {
      return null;
    }

    if (field.type === 'select' && typeof value === 'number') {
      if (field.tags && field.tags[value]) {
        return field.tags[value].label || field.tags[value].value || field.tags[value];
      }
      return null;
    }
    
    if (field.type === 'radio' && typeof value === 'number') {
      if (field.options && field.options[value]) {
        return field.options[value];
      }
      return null;
    }
    
    if (field.type === 'select' && typeof value === 'string') {
      const tag = field.tags?.find(t => (t.value || t) === value);
      return tag ? (tag.label || tag.value || tag) : value;
    }

    if (field.type === 'radio' && typeof value === 'string') {
      return value;
    }
    
    return value;
  };

  const getLocationDisplay = () => {
    if (!contact.location) return null;
    
    if (typeof contact.location === 'object' && contact.location !== null) {
      if (contact.location.displayName) {
        return contact.location.displayName;
      }
      if (contact.location.city && contact.location.country) {
        return `${contact.location.city}, ${contact.location.country}`;
      }
      if (contact.location.city) {
        return contact.location.city;
      }
      if (contact.location.country) {
        return contact.location.country;
      }
    }
    
    if (typeof contact.location === 'string') {
      return contact.location;
    }
    
    return null;
  };

  // Get country flag from location
  const getCountryFlag = () => {
    if (!contact.location) return null;
    
    if (typeof contact.location === 'object' && contact.location.countryCode) {
      return cityAutocomplete.getFlag(contact.location.countryCode);
    }
    
    return null;
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    await updateContact(contact.id, {
      ...contact,
      isFavorite: !contact.isFavorite
    });
  };

  const getTagDisplay = (fieldId) => {
    const value = contact[fieldId];
    if (value === undefined || value === '' || value === null) return null;

    const field = allFields.find(f => f.id === fieldId);
    if (!field) return value;

    return getFieldDisplayValue(field, value);
  };

  const handleInstagramClick = (e) => {
    e.stopPropagation();
    if (contact.instagram) {
      const username = contact.instagram.startsWith('@') 
        ? contact.instagram.substring(1) 
        : contact.instagram;
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  const getInstagramDisplay = () => {
    if (!contact.instagram) return null;
    return contact.instagram.startsWith('@') 
      ? contact.instagram 
      : `@${contact.instagram}`;
  };

  // Retirer le badge "Nouveau" quand on clique pour éditer
  const handleEdit = async () => {
    if (contact.isNew) {
      await updateContact(contact.id, { ...contact, isNew: false });
    }
    onEdit();
  };

  const countryFlag = getCountryFlag();

  return (
    <div className="contact-card" onClick={handleEdit}>
      <div className="contact-card-header">
        <div className="contact-info">
          <div className="contact-name-row">
            <span className="contact-name">
              {contact.firstName || 'Sans nom'}
              {countryFlag && <span className="contact-flag-inline"> {countryFlag}</span>}
            </span>
            {contact.isNew && <span className="badge-new">✨ Nouveau</span>}
          </div>
          {contact.instagram && (
            <div 
              className="contact-instagram" 
              onClick={handleInstagramClick}
              title="Ouvrir le profil Instagram"
            >
              {getInstagramDisplay()}
            </div>
          )}
        </div>
        <button
          className={`favorite-btn ${contact.isFavorite ? 'active' : ''}`}
          onClick={toggleFavorite}
          title={contact.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {contact.isFavorite ? '⭐' : '☆'}
        </button>
      </div>
      <div className="contact-card-body">
        {getTagDisplay('relationType') && (
          <div className="contact-tag">
            <span className="tag-label">Relation:</span>
            <span className="tag-value">{getTagDisplay('relationType')}</span>
          </div>
        )}
        
        {getTagDisplay('meetingPlace') && (
          <div className="contact-tag">
            <span className="tag-label">Lieu:</span>
            <span className="tag-value">{getTagDisplay('meetingPlace')}</span>
          </div>
        )}
        
        {getTagDisplay('discussionStatus') && (
          <div className="contact-tag">
            <span className="tag-label">Statut:</span>
            <span className="tag-value">{getTagDisplay('discussionStatus')}</span>
          </div>
        )}

        {getLocationDisplay() && (
          <div className="contact-location">
            📍 {getLocationDisplay()}
          </div>
        )}

        {contact.notes && (
          <div className="contact-notes">
            {contact.notes.substring(0, 80)}
            {contact.notes.length > 80 && '...'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
