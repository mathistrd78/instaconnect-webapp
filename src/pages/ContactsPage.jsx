import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import ContactCard from '../components/ContactCard';
import ContactModal from '../components/ContactModal';
import FilterBar from '../components/FilterBar';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import '../styles/Contacts.css';

const ContactsPage = () => {
  const { contacts } = useApp();
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...contacts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.firstName?.toLowerCase().includes(query) ||
        contact.instagram?.toLowerCase().includes(query) ||
        contact.notes?.toLowerCase().includes(query)
      );
    }

    // Apply active filters
    Object.keys(activeFilters).forEach(filterKey => {
      if (activeFilters[filterKey] && activeFilters[filterKey].length > 0) {
        filtered = filtered.filter(contact =>
          activeFilters[filterKey].includes(contact[filterKey])
        );
      }
    });

    // Sort by creation date (most recent first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, activeFilters]);

  const handleAddContact = () => {
    setEditingContact(null);
    setShowModal(true);
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
    <div className="contacts-page">
      {/* Header */}
      <div className="contacts-header">
        <h1>InstaConnect</h1>
        
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
        />

        <div className="contacts-count">
          <span className="count-number">{filteredContacts.length}</span> contact(s)
        </div>

        <FilterBar
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
        />
      </div>

      {/* Content */}
      <div className="contacts-content">
        {contacts.length === 0 ? (
          <EmptyState
            icon="📱"
            text="Aucun contact pour le moment"
            actionText="Ajouter votre premier contact"
            onAction={handleAddContact}
          />
        ) : filteredContacts.length === 0 ? (
          <EmptyState
            icon="🔍"
            text="Aucun contact ne correspond à votre recherche"
          />
        ) : (
          <div className="contacts-grid">
            {filteredContacts.map(contact => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onEdit={() => handleEditContact(contact)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Button */}
      <button className="fab" onClick={handleAddContact} title="Ajouter un contact">
        ➕
      </button>

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
