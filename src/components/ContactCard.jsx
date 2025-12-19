import React from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/ContactCard.css';

const ContactCard = ({ contact, onEdit }) => {
  const { updateContact, getAllFields } = useApp();
  
  const allFields = getAllFields();

  // Helper function to get display value for radio/select fields
  const getFieldDisplayValue = (field, value) => {
    if (value === undefined || value === '' || value === null) {
      return null;
    }

    // Si le champ est select et que la valeur est un nombre (index)
    if (field.type === 'select' && typeof value === 'number') {
      if (field.tags && field.tags[value]) {
        return field.tags[value].label || field.tags[value].value || field.tags[value];
      }
      return null;
    }
    
    // Si le champ est radio et que la valeur est un nombre (index)
    if (field.type === 'radio' && typeof value === 'number') {
      if (field.options && field.options[value]) {
        return field.options[value];
      }
      return null;
    }
    
    // Pour les anciens contacts (valeur texte) avec select
    if (field.type === 'select' && typeof value === 'string') {
      const tag = field.tags?.find(t => (t.value || t) === value);
      return tag ? (tag.label || tag.value || tag) : value;
    }

    // Pour les anciens contacts (valeur texte) avec radio
    if (field.type === 'radio' && typeof value === 'string') {
      return value;
    }
    
    // Autres types de champs
    return value;
  };

  // Get location display
  const getLocationDisplay = () => {
    if (!contact.location) return null;
    
    // Si c'est un objet (ancien format)
    if (typeof contact.location === 'object' && contact.location !== null) {
      if (contact.location.displayName) {
        return contact.location.displayName;
      }
      // Construire manuellement si displayName n'existe pas
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
    
    // Si c'est une string (nouveau format)
    if (typeof contact.location === 'string') {
      return contact.location;
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

  // Get tag display with index support
  const getTagDisplay = (fieldId) => {
    const value = contact[fieldId];
    if (value === undefined || value === '' || value === null) return null;

    // Find the field definition
    const field = allFields.find(f => f.id === fieldId);
    if (!field) return value;

    // Use helper function for display value
    return getFieldDisplayValue(field, value);
  };

  const handleInstagramClick = (e) => {
    e.stopPropagation();
    if (contact.instagram) {
      // Remove @ if present at the beginning
      const username = contact.instagram.startsWith('@') 
        ? contact.instagram.substring(1) 
        : contact.instagram;
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  // Format Instagram username (remove @ if present)
  const getInstagramDisplay = () => {
    if (!contact.instagram) return null;
    return contact.instagram.startsWith('@') 
      ? contact.instagram 
      : `@${contact.instagram}`;
  };

  return (
    <div className="contact-card" onClick={onEdit}>
      <div className="contact-card-header">
        <div className="contact-info">
          <div className="contact-name">{contact.firstName || 'Sans nom'}</div>
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
