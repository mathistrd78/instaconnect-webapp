import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
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

  // Apply filters from navigation state (from StatsPage or AnalysePage)
  useEffect(() => {
    if (location.state?.filters) {
      setActiveFilters(location.state.filters);
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
    
    // Detect if we need to apply "Nouveaux" filter from AnalysePage
    if (location.state?.applyNewFilter) {
      setActiveFilters({ isNew: ['true'] });
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Detect scroll to show/hide scroll-to-top button
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

  // Check if contact is complete
  const isContactComplete = (contact) => {
    const allFields = getAllFields();
    const requiredFields = allFields.filter(f => f.required);
    return requiredFields.every(field => {
      const value = contact[field.id];
      return value !== undefined && value !== null && value !== '';
    });
  };

  useEffect(() => {
    // Apply filters and search
    let filtered = [...contacts];

    // Search filter - only search by firstName prefix
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact => {
        const firstName = (contact.firstName || '').toLowerCase();
        return firstName.startsWith(query);
      });
    }

    // Apply active filters
    Object.keys(activeFilters).forEach(filterKey => {
      if (activeFilters[filterKey] && activeFilters[filterKey].length > 0) {
        filtered = filtered.filter(contact => {
          // Special filter: isNew
          if (filterKey === 'isNew') {
            return contact.isNew === true;
          }
          
          // Special filter: isFavorite
          if (filterKey === 'isFavorite') {
            return contact.isFavorite === true;
          }
          
          // Special filter: isComplete
          if (filterKey === 'isComplete') {
            const isComplete = isContactComplete(contact);
            return activeFilters[filterKey].some(value => {
              if (value === 'true') return isComplete;
              if (value === 'false') return !isComplete;
              return false;
            });
          }
          
          // Special filter: country
          if (filterKey === 'country') {
            let contactCountry = '';
            if (contact.location) {
              if (typeof contact.location === 'object' && contact.location.country) {
                contactCountry = contact.location.country;
              } else if (typeof contact.location === 'string' && contact.location.includes(',')) {
                contactCountry = contact.location.split(',').pop().trim();
              }
            }
            return activeFilters[filterKey].includes(contactCountry);
          }
          
          // Checkbox fields (like "dejaPecho")
          const field = getAllFields().find(f => f.id === filterKey);
          if (field && field.type === 'checkbox') {
            const contactValue = contact[filterKey] ? 'true' : 'false';
            return activeFilters[filterKey].includes(contactValue);
          }
          
          // Radio/Select fields with index values
          if (field && (field.type === 'radio' || field.type === 'select')) {
            const contactValue = contact[filterKey];
            if (typeof contactValue === 'number') {
              return activeFilters[filterKey].includes(contactValue.toString());
            }
          }
          
          // Regular filters (old string values)
          return activeFilters[filterKey].includes(contact[filterKey]);
        });
      }
    });

    // Sort alphabetically by firstName
    filtered.sort((a, b) => {
      const nameA = (a.firstName || '').toLowerCase();
      const nameB = (b.firstName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, activeFilters, getAllFields]);

  // Group contacts by first letter (ignore @ for Instagram usernames)
  const groupedContacts = useMemo(() => {
    const groups = {};
    filteredContacts.forEach(contact => {
      let firstName = contact.firstName || '';
      // Si le prénom commence par @, on prend la lettre suivante
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

  // Get sorted letters
  const sortedLetters = useMemo(() => {
    return Object.keys(groupedContacts).sort();
  }, [groupedContacts]);

  // Generate alphabet for quick navigation
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
      {/* Header */}
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

        {/* Search Bar */}
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

        {/* Alphabet Quick Navigation */}
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

      {/* Content */}
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

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          className="scroll-to-top-btn"
          onClick={scrollToTop}
          title="Retour en haut"
        >
          ↑
        </button>
      )}

      {/* Contact Modal */}
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
