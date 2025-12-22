import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { cityAutocomplete } from '../utils/cityAutocomplete';
import '../styles/FilterBar.css';

const FilterBar = ({ activeFilters, onFilterChange }) => {
  const { defaultFields, customTags, customFields, contacts } = useApp();
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get all fields that can be filtered (select, radio, checkbox)
  const filterFields = [
    ...defaultFields.filter(f => f.type === 'select' || f.type === 'radio' || f.type === 'checkbox'),
    ...customFields.filter(f => f.type === 'select' || f.type === 'radio' || f.type === 'checkbox')
  ];

  // Add special filters IN ORDER
  const specialFilters = [
    {
      id: 'isNew',
      label: 'Nouveaux',
      type: 'boolean',
      order: -3,
      options: [
        { value: 'true', label: '✨ Nouveaux' }
      ]
    },
    {
      id: 'isFavorite',
      label: 'Favoris',
      type: 'boolean',
      order: -2,
      options: [
        { value: 'true', label: '⭐ Favoris' }
      ]
    },
    {
      id: 'isComplete',
      label: 'Profil complet',
      type: 'boolean',
      order: -1,
      options: [
        { value: 'true', label: '✅ Complet' },
        { value: 'false', label: '⚠️ Incomplet' }
      ]
    },
    {
      id: 'country',
      label: 'Pays',
      type: 'dynamic',
      order: 1000,
      options: []
    }
  ];

  const getCountryOptions = () => {
    const countryMap = new Map();
    
    contacts.forEach(contact => {
      if (contact.location) {
        let countryCode = '';
        let countryName = '';
        
        if (typeof contact.location === 'object' && contact.location.countryCode) {
          countryCode = contact.location.countryCode;
          countryName = cityAutocomplete.normalizeCountryName(
            contact.location.country, 
            countryCode
          );
        } else if (typeof contact.location === 'string' && contact.location.includes(',')) {
          const parts = contact.location.split(',');
          const lastPart = parts[parts.length - 1].trim();
          countryCode = cityAutocomplete.guessCountryCode(lastPart);
          
          if (countryCode) {
            countryName = cityAutocomplete.normalizeCountryName(lastPart, countryCode);
          } else {
            countryName = lastPart;
          }
        }
        
        if (countryCode) {
          if (!countryMap.has(countryCode)) {
            countryMap.set(countryCode, {
              code: countryCode,
              name: countryName,
              flag: cityAutocomplete.getFlag(countryCode)
            });
          }
        }
      }
    });
    
    return Array.from(countryMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(country => ({
        value: country.code,
        label: `${country.flag} ${country.name}`
      }));
  };

  const getFieldOptions = (field) => {
    if (field.id === 'isNew' || field.id === 'isFavorite' || field.id === 'isComplete') {
      return field.options;
    }
    
    if (field.id === 'country') {
      return getCountryOptions();
    }

    if (field.type === 'checkbox') {
      return [
        { value: 'true', label: 'Oui' },
        { value: 'false', label: 'Non' }
      ];
    }

    if (field.type === 'radio' && field.options) {
      return field.options.map((opt, index) => ({
        value: index.toString(),
        label: opt
      }));
    }

    const customFieldTags = customTags[field.id] || [];
    const allTags = [...(field.tags || []), ...customFieldTags];
    
    const uniqueTags = [];
    const seenValues = new Set();
    
    allTags.forEach((tag, index) => {
      const value = typeof tag === 'object' ? (tag.value || index.toString()) : tag;
      if (!seenValues.has(value)) {
        seenValues.add(value);
        uniqueTags.push({
          value: index.toString(),
          label: typeof tag === 'object' ? (tag.label || tag.value || tag) : tag
        });
      }
    });
    
    return uniqueTags;
  };

  const toggleFilter = (fieldId, value) => {
    const current = activeFilters[fieldId] || [];
    const newFilters = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    const updatedFilters = {
      ...activeFilters,
      [fieldId]: newFilters.length > 0 ? newFilters : undefined
    };
    
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === undefined) {
        delete updatedFilters[key];
      }
    });
    
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
    setOpenDropdown(null);
  };

  const hasActiveFilters = Object.values(activeFilters).some(f => f && f.length > 0);

  const allFilters = [
    ...specialFilters,
    ...filterFields.map(f => ({ ...f, order: f.order !== undefined ? f.order : 500 }))
  ].sort((a, b) => (a.order || 0) - (b.order || 0));

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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenDropdown(isOpen ? null : field.id);
              }}
              type="button"
            >
              {field.label}
              {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
              <span className="filter-arrow">{isOpen ? '▲' : '▼'}</span>}
            </button>

            {isOpen && (
              <div 
                className="filter-dropdown-menu"
                onMouseDown={(e) => e.preventDefault()}
              >
                {fieldOptions.length === 0 ? (
                  <div className="filter-empty">Aucune option disponible</div>
                ) : (
                  fieldOptions.map(option => {
                    const optionValue = option.value || option;
                    const optionLabel = option.label || option;
                    const isChecked = activeFilters[field.id]?.includes(optionValue) || false;
                    
                    return (
                      <div 
                        key={`${field.id}-${optionValue}`}
                        className="filter-option"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFilter(field.id, optionValue);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                        />
                        <span>{optionLabel}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}

      {hasActiveFilters && (
        <button 
          className="filter-clear-btn" 
          onClick={clearFilters}
          type="button"
        >
          ✕ Effacer les filtres
        </button>
      )}
    </div>
  );
};

export default FilterBar;
