import React from 'react';
import '../styles/ContactViewModal.css';

const ContactViewModal = ({ contact, onClose, onEdit }) => {
  if (!contact) return null;

  const getLocationDisplay = () => {
    if (!contact.location) return null;
    
    if (typeof contact.location === 'object' && contact.location !== null) {
      if (contact.location.displayName) {
        return contact.location.displayName;
      }
      if (contact.location.city && contact.location.country) {
        return `${contact.location.city}, ${contact.location.country}`;
      }
      if (contact.location.city) return contact.location.city;
      if (contact.location.country) return contact.location.country;
    }
    
    if (typeof contact.location === 'string') {
      return contact.location;
    }
    
    return null;
  };

  const getInstagramDisplay = () => {
    if (!contact.instagram) return null;
    return contact.instagram.startsWith('@') ? contact.instagram : `@${contact.instagram}`;
  };

  const handleInstagramClick = () => {
    if (contact.instagram) {
      const username = contact.instagram.startsWith('@') 
        ? contact.instagram.substring(1) 
        : contact.instagram;
      window.open(`https://instagram.com/${username}`, '_blank');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getBirthDate = () => {
    if (!contact.birthDate) return null;
    return formatDate(contact.birthDate);
  };

  const getNextMeeting = () => {
    if (!contact.nextMeeting) return null;
    return formatDate(contact.nextMeeting);
  };

  return (
    <div className="contact-view-overlay" onClick={onClose}>
      <div className="contact-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="contact-view-header">
          <h2>👤 Fiche Contact</h2>
          <button className="contact-view-close" onClick={onClose}>✕</button>
        </div>

        <div className="contact-view-body">
          {/* Prénom */}
          <div className="view-field">
            <label className="view-label">Prénom</label>
            <div className="view-value">{contact.firstName || '—'}</div>
          </div>

          {/* Instagram */}
          {contact.instagram && (
            <div className="view-field">
              <label className="view-label">Instagram</label>
              <div 
                className="view-value view-instagram" 
                onClick={handleInstagramClick}
              >
                {getInstagramDisplay()}
              </div>
            </div>
          )}

          {/* Localisation */}
          {getLocationDisplay() && (
            <div className="view-field">
              <label className="view-label">Localisation</label>
              <div className="view-value">📍 {getLocationDisplay()}</div>
            </div>
          )}

          {/* Anniversaire */}
          {getBirthDate() && (
            <div className="view-field">
              <label className="view-label">Anniversaire</label>
              <div className="view-value">🎂 {getBirthDate()}</div>
            </div>
          )}

          {/* Prochain RDV */}
          {getNextMeeting() && (
            <div className="view-field">
              <label className="view-label">Prochain RDV</label>
              <div className="view-value">📅 {getNextMeeting()}</div>
            </div>
          )}

          {/* Type de relation */}
          {contact.relationType && (
            <div className="view-field">
              <label className="view-label">Type de relation</label>
              <div className="view-value">{contact.relationType}</div>
            </div>
          )}

          {/* Lieu de rencontre */}
          {contact.meetingPlace && (
            <div className="view-field">
              <label className="view-label">Lieu de rencontre</label>
              <div className="view-value">{contact.meetingPlace}</div>
            </div>
          )}

          {/* Statut de discussion */}
          {contact.discussionStatus && (
            <div className="view-field">
              <label className="view-label">Statut de discussion</label>
              <div className="view-value">{contact.discussionStatus}</div>
            </div>
          )}

          {/* Sexe */}
          {contact.gender && (
            <div className="view-field">
              <label className="view-label">Sexe</label>
              <div className="view-value">{contact.gender}</div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="view-field">
              <label className="view-label">Notes</label>
              <div className="view-value view-notes">{contact.notes}</div>
            </div>
          )}
        </div>

        <div className="contact-view-footer">
          <button className="btn-edit" onClick={onEdit}>
            ✏️ Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactViewModal;
