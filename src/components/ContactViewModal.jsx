import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { cityAutocomplete } from '../utils/cityAutocomplete';
import '../styles/ContactViewModal.css';

const ContactViewModal = ({ contact, onClose, onEdit }) => {
  const { getAllFields, deleteContact } = useApp();
  const { currentUser } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const allFields = getAllFields();

  const getFieldDisplayValue = (field, value) => {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    if (field.type === 'select' && typeof value === 'number') {
      if (field.tags && field.tags[value]) {
        return field.tags[value].label || field.tags[value].value || field.tags[value];
      }
      return `Option ${value}`;
    }
    
    if (field.type === 'radio' && typeof value === 'number') {
      if (field.options && field.options[value]) {
        return field.options[value];
      }
      return `Option ${value}`;
    }
    
    if (field.type === 'select' && typeof value === 'string') {
      const tag = field.tags?.find(t => (t.value || t) === value);
      return tag ? (tag.label || tag.value || tag) : value;
    }

    if (field.type === 'radio' && typeof value === 'string') {
      return value;
    }

    if (field.type === 'checkbox') {
      return value ? 'Oui' : 'Non';
    }

    if (field.type === 'date') {
      if (field.id === 'birthDate') {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          });
        }
      }
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

  const handleInstagramClick = () => {
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

  const handleDeleteAndUnfollow = async () => {
    if (!currentUser || !contact.instagram) {
      alert('Impossible de supprimer ce contact');
      return;
    }

    // Confirmation
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer ${contact.firstName} et l'ajouter à la liste "A ne plus suivre" ?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);

    try {
      const userId = currentUser.uid;
      
      // Extraire le username Instagram (sans @)
      const username = contact.instagram.startsWith('@') 
        ? contact.instagram.substring(1) 
        : contact.instagram;

      // 🛡️ OPÉRATION ATOMIQUE avec arrayUnion
      // Pas besoin de lire d'abord - Firebase gère tout !
      // arrayUnion ajoute seulement si pas déjà présent
      await updateDoc(doc(db, 'users', userId), {
        doNotFollowList: arrayUnion(username)
      });

      console.log(`✅ ${username} ajouté à la liste "A ne plus suivre" (ATOMIC OPERATION)`);

      // Supprimer le contact
      await deleteContact(contact.id);
      console.log('✅ Contact supprimé');

      // Fermer la modale
      onClose();

      // Message de succès
      alert(`${contact.firstName} a été supprimé et ajouté à la liste "A ne plus suivre"`);

    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du contact');
      setIsDeleting(false);
    }
  };

  return (
    <div className="contact-view-overlay" onClick={onClose}>
      <div className="contact-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="contact-view-header">
          <h2>{contact.firstName || 'Contact'}</h2>
          <button className="contact-view-close" onClick={onClose}>✕</button>
        </div>

        <div className="contact-view-body">
          {allFields.map(field => {
            let displayValue;
            
            if (field.id === 'location') {
              displayValue = getLocationDisplay();
            } else {
              const value = contact[field.id];
              displayValue = getFieldDisplayValue(field, value);
            }

            if (!displayValue) return null;

            return (
              <div key={field.id} className="view-field">
                <div className="view-label">{field.label}</div>
                {field.id === 'instagram' ? (
                  <div 
                    className="view-value view-instagram" 
                    onClick={handleInstagramClick}
                    title="Ouvrir le profil Instagram"
                  >
                    {getInstagramDisplay()}
                  </div>
                ) : field.id === 'notes' ? (
                  <div className="view-value view-notes">{displayValue}</div>
                ) : (
                  <div className="view-value">{displayValue}</div>
                )}
              </div>
            );
          })}
        </div>

        <div className="contact-view-footer">
          <button 
            className="btn-edit-contact" 
            onClick={onEdit}
            disabled={isDeleting}
          >
            Modifier ✏️
          </button>
          <button 
            className="btn-delete-unfollow" 
            onClick={handleDeleteAndUnfollow}
            disabled={isDeleting}
          >
            {isDeleting ? '...' : 'Supprimer et unfollowed 🚫'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactViewModal;
