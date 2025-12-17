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

    // Regular fields with tags - REMOVE DUPLICATES
    const customFieldTags = customTags[field.id] || [];
    const allTags = [...(field.tags || []), ...customFieldTags];
    
    // Remove duplicates based on value
    const uniqueTags = [];
    const seenValues = new Set();
    
    allTags.forEach(tag => {
      const value = tag.value || tag;
      if (!seenValues.has(value)) {
        seenValues.add(value);
        uniqueTags.push(tag);
      }
    });
    
    return uniqueTags;
  };

  const toggleFilter = (fieldId, value) => {
    console.log('Toggle filter:', fieldId, value); // Debug
    
    const current = activeFilters[fieldId] || [];
    const newFilters = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    const updatedFilters = {
      ...activeFilters,
      [fieldId]: newFilters.length > 0 ? newFilters : undefined
    };
    
    // Remove undefined values
    Object.keys(updatedFilters).forEach(key => {
      if (updatedFilters[key] === undefined) {
        delete updatedFilters[key];
      }
    });
    
    console.log('Updated filters:', updatedFilters); // Debug
    onFilterChange(updatedFilters);
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenDropdown(isOpen ? null : field.id);
              }}
              type="button"
            >
              {field.label}
              {activeCount > 0 && <span className="filter-count">{activeCount}</span>}
              <span className="filter-arrow">{isOpen ? '▲' : '▼'}</span>
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
```

---

## ✅ Changements clés

**Problème 1 : Sélection aléatoire**
- ✅ Remplacé `onClick` par `onMouseDown` (plus fiable)
- ✅ Ajouté `e.preventDefault()` pour empêcher comportements par défaut
- ✅ Input en `readOnly` au lieu de `onChange`
- ✅ Ajouté `type="button"` sur les boutons

**Problème 2 : Doublons**
- ✅ Fonction de dédoublonnage basée sur `value`
- ✅ Utilise un `Set` pour tracker les valeurs déjà vues
- ✅ Ne garde que la première occurrence

**Debug**
- ✅ Ajout de `console.log` pour voir ce qui se passe

---

## 🧪 Test après le push

1. Ouvrez la console (F12)
2. Cliquez sur une option
3. Vous devriez voir :
```
   Toggle filter: relationType "Ami"
   Updated filters: {relationType: ["Ami"]}
