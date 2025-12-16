import React from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/ContactCard.css';

const ContactCard = ({ contact, onEdit }) => {
  const { deleteContact } = useApp();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Supprimer ${contact.firstName || 'ce contact'} ?`)) {
      await deleteContact(contact.id);
    }
  };

  const getInitial = () => {
    return contact.firstName?.charAt(0)?.toUpperCase() || '?';
  };

  const getTagDisplay = (fieldId) => {
    const value = contact[fieldId];
    if (!value) return null;
    return value;
  };

  // FIX: Gérer le champ location (objet ou string)
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

  return (
    <div className="contact-card" onClick={onEdit}>
      <div className="contact-card-header">
        <div className="contact-avatar">{getInitial()}</div>
        <div className="contact-info">
          <div className="contact-name">{contact.firstName || 'Sans nom'}</div>
          {contact.instagram && (
            <div className="contact-instagram">@{contact.instagram}</div>
          )}
        </div>
      </div>

      <div className="contact-card-body">
        {contact.relationType && (
          <div className="contact-tag">
            <span className="tag-label">Relation:</span>
            <span className="tag-value">{getTagDisplay('relationType')}</span>
          </div>
        )}
        
        {contact.meetingPlace && (
          <div className="contact-tag">
            <span className="tag-label">Lieu:</span>
            <span className="tag-value">{getTagDisplay('meetingPlace')}</span>
          </div>
        )}
        
        {contact.discussionStatus && (
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

      <div className="contact-card-footer">
        <button
          className="contact-delete-btn"
          onClick={handleDelete}
          title="Supprimer"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
