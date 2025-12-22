import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { cityAutocomplete } from '../utils/cityAutocomplete';
import ContactCard from '../components/ContactCard';
import ContactModal from '../components/ContactModal';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import '../styles/Contacts.css';

const ContactsPage = () => {
  const location = useLocation();
  const { contacts, getAllFields, updateContact } = useApp();
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const letterRefs = useRef({});
  const headerRef = useRef(null);

  useEffect(() => {
    if (location.state?.filters) {
      setActiveFilters(location.state.filters);
      window.history.replaceState({}, document.title);
    }
    
    if (location.state?.applyNewFilter) {
      setActiveFilters({ isNew: ['true'] });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        const headerBottom = headerRef.current.getBoundingClientRect().bottom;
        setShowScrollTop(headerBottom < 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isContactComplete = (contact) => {
    const allFields = getAllFields();
    const requiredFields = allFields.filter(f => f.required);
    return requiredFields.every(field => {
      const value = contact[field.id];
      return value !== undefined && value !== null && value !== '';
    });
  };

  useEffect(() => {
    let filtered = [...contacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => {
        const firstName = (contact.firstName || '').toLowerCase();
        return firstName.startsWith(query);
      });
    }

    Object.keys(activeFilters).forEach(filterKey => {
      if (activeFilters[filterKey] && activeFilters[filterKey].length > 0) {
        filtered = filtered.filter(contact => {
          if (filterKey === 'isNew') {
            return contact.isNew === true;
          }
          
          if (filterKey === 'isFavorite') {
            return contact.isFavorite === true;
          }
          
          if (filterKey === 'isComplete') {
            const isComplete = isContactComplete(contact);
            return activeFilters[filterKey].some(value => {
              if (value === 'true') return isComplete;
              if (value === 'false') return !isComplete;
              return false;
            });
          }
          
          // Special filter: country (par countryCode)
          if (filterKey === 'country') {
            let contactCountryCode = '';
            
            if (contact.location) {
              if (typeof contact.location === 'object' && contact.location.countryCode) {
                contactCountryCode = contact.location.countryCode;
              } else if (typeof contact.location === 'string' && contact.location.includes(',')) {
                const lastPart = contact.location.split(',').pop().trim();
                contactCountryCode = cityAutocomplete.guessCountryCode(lastPart);
              }
            }
            
            return activeFilters[filterKey].includes(contactCountryCode);
          }
          
          const field = getAllFields().find(f => f.id === filterKey);
          if (field && field.type === 'checkbox') {
            const contactValue = contact[filterKey] ? 'true' : 'false';
            return activeFilters[filterKey].includes(contactValue);
          }
          
          if (field && (field.type === 'radio' || field.type === 'select')) {
            const contactValue = contact[filterKey];
            if (typeof contactValue === 'number') {
              return activeFilters[filterKey].includes(contactValue.toString());
            }
          }
          
          return activeFilters[filterKey].includes(contact[filterKey]);
        });
      }
    });

    filtered.sort((a, b) => {
      const nameA = (a.firstName || '').toLowerCase();
      const nameB = (b.firstName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, activeFilters, getAllFields]);

  const groupedContacts = useMemo(() => {
    const groups = {};
    filteredContacts.forEach(contact => {
      let firstName = contact.firstName || '';
      if (firstName.startsWith('@')) {
        firstName = firstName.substring(1);
      }
      const firstLetter = (firstName[0] || '#').toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(contact);
    });
    return groups;
  }, [filteredContacts]);

  const sortedLetters = useMemo(() => {
    return Object.keys(groupedContacts).sort();
  }, [groupedContacts]);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

  const scrollToLetter = (letter) => {
    const element = letterRefs.current[letter];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleSaveContact = async (updatedData) => {
    try {
      await updateContact(editingContact.id, updatedData);
      handleCloseModal();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Erreur lors de la sauvegarde du contact');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  return (
    <div className="contacts-page-web">
      <div className="contacts-header-web" ref={headerRef}>
        <div className="contacts-header-top">
          <div>
            <h1>👥 Contacts</h1>
            <p className="contacts-subtitle">
              <span className="count-number">{filteredContacts.length}</span> 
              {' '}sur {contacts.length} contact(s)
            </p>
          </div>
        </div>

        <div className="contacts-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="contacts-search-input"
            placeholder="Rechercher un contact par prénom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="alphabet-nav">
          {alphabet.map(letter => {
            const hasContacts = sortedLetters.includes(letter);
            return (
              <button
                key={letter}
                className={`alphabet-letter ${hasContacts ? 'active' : 'disabled'}`}
                onClick={() => hasContacts && scrollToLetter(letter)}
                disabled={!hasContacts}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <FilterBar
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>

      <div className="contacts-content-web">
        {contacts.length === 0 ? (
          <EmptyState
            icon="📱"
            text="Aucun contact pour le moment"
            actionText="Lancer une analyse Instagram"
            onAction={() => window.location.href = '/app/analyse'}
          />
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            icon="🔍"
            text="Aucun contact ne correspond à votre recherche"
          />
        ) : (
          <div className="contacts-list-grouped">
            {sortedLetters.map(letter => (
              <div 
                key={letter} 
                className="contact-group"
                ref={(el) => (letterRefs.current[letter] = el)}
              >
                <div className="letter-divider">{letter}</div>
                <div className="contacts-grid-web">
                  {groupedContacts[letter].map(contact => (
                    <ContactCard
                      key={contact.id}
                      contact={contact}
                      onEdit={() => handleEditContact(contact)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showScrollTop && (
        <button 
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          title="Retour en haut"
        >
          ↑
        </button>
      )}

      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={handleCloseModal}
          onSave={handleSaveContact}
        />
      )}
    </div>
  );
};

export default ContactsPage;
