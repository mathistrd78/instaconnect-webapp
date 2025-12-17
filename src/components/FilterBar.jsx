import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/FilterBar.css';

const FilterBar = ({ activeFilters, onFilterChange }) => {
  const { defaultFields, customTags, customFields, contacts } = useApp();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all fields that can be filtered
  const filterFields = [
    ...defaultFields.filter(f => f.type === 'select' || f.type === 'radio'),
    ...customFields.filter(f => f.type === 'select' || f.type === 'radio')
  ];

  // Add special filters
  const specialFilters = [
    {
      id: 'isFavorite',
      label: 'Favoris',
      type: 'boolean',
      options: [
        { value: 'true', label: '⭐ Favoris' }
      ]
    },
    {
      id: 'isComplete',
      label: 'Profil complet',
      type: 'boolean',
      options: [
        { value: 'true', label: '✅ Complet' },
        { value: 'false', label: '⚠️ Incomplet' }
      ]
    },
    {
      id: 'country',
      label: 'Pays',
      type: 'dynamic',
      options: [] // Will be populated dynamically
    }
  ];

  // Get unique countries from contacts
  const getCountryOptions = () => {
    const countries = new Set();
    contacts.forEach(contact => {
      if (contact.location) {
        if (typeof contact.location === 'object' && contact.location.country) {
          countries.add(contact.location.country);
        } else if (typeof contact.location === 'string' && contact.location.includes(',')) {
          const country = contact.location.split(',').pop().trim();
          if (country) countries.add(country);
        }
      }
    });
    return Array.from(countries).sort().map(country => ({
      value: country,
      label: country
    }));
  };

  const getFieldOptions = (field) => {
    // Special filters
    if (field.id === 'isFavorite' || field.id === 'isComplete') {
      return field.options;
    }
    
    if (field.id === 'country') {
      return getCountryOptions();
    }

    // Regular fields with tags
    const customFieldTags = customTags[field.id] || [];
    const allTags = [...(field.tags || []), ...customFieldTags];
    return allTags;
  };

  const toggleFilter = (e, fieldId, value) => {
    e.preventDefault();
    e.stopPropagation();
    
    const current = activeFilters[fieldId] || [];
    const newFilters = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    onFilterChange({
      ...activeFilters,
      [fieldId]: newFilters.length > 0 ? newFilters : undefined
    });
  };

  const clearFilters = () => {
    onFilterChange({});
    setOpenDropdown(null);
  };

  const hasActiveFilters = Object.values(activeFilters).some(f => f && f.length > 0);

  const allFilters = [...filterFields, ...specialFilters];

  return (
    <div className="filter-bar" ref={dropdownRef}>
      {allFilters.map(field => {
        const fieldOptions = getFieldOptions(field);
        const activeCount = activeFilters[field.id]?.length || 0;
        const isOpen = openDropdown === field.id;

        return (
          <div key={field.id} className="filter-dropdown">
            <button
              className={`filter-btn ${activeCount > 0 ? 'active' : ''}`}
              onClick={() => setOpenDropdown(isOpen ? null : field.id)}
            >
              {field.label}
              {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
              <span className="filter-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="filter-dropdown-menu">
                {fieldOptions.length === 0 ? (
                  <div className="filter-empty">Aucune option disponible</div>
                ) : (
                  fieldOptions.map(option => {
                    const optionValue = option.value || option;
                    const optionLabel = option.label || option;
                    
                    return (
                      <label 
                        key={optionValue} 
                        className="filter-option"
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters[field.id]?.includes(optionValue) || false}
                          onChange={(e) => toggleFilter(e, field.id, optionValue)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span>{optionLabel}</span>
                      </label>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {hasActiveFilters && (
        <button className="filter-clear-btn" onClick={clearFilters}>
          ✕ Effacer les filtres
        </button>
      )}
    </div>
  );
};

export default FilterBar;
