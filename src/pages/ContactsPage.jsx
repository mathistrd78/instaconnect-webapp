import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import ContactCard from '../components/ContactCard';
import ContactModal from '../components/ContactModal';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import '../styles/Contacts.css';

const ContactsPage = () => {
  const { contacts } = useApp();
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const letterRefs = useRef({});

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
        filtered = filtered.filter(contact =>
          activeFilters[filterKey].includes(contact[filterKey])
        );
      }
    });

    // Sort alphabetically by firstName
    filtered.sort((a, b) => {
      const nameA = (a.firstName || '').toLowerCase();
      const nameB = (b.firstName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, activeFilters]);

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

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContact(null);
  };

  return (
    <div className="contacts-page-web">
      {/* Header */}
      <div className="contacts-header-web">
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

      {/* Contact Modal */}
      {showModal && (
        <ContactModal
          contact={editingContact}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ContactsPage;
