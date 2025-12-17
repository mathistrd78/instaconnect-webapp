import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/FilterBar.css';

const FilterBar = ({ activeFilters, onFilterChange }) => {
  const { defaultFields, customTags } = useApp();
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

  const filterFields = defaultFields.filter(f => 
    f.type === 'select' || f.type === 'radio'
  );

  const getFieldTags = (field) => {
    // Merge default tags with custom tags
    const customFieldTags = customTags[field.id] || [];
    const allTags = [...(field.tags || []), ...customFieldTags];
    return allTags;
  };

  const toggleFilter = (e, fieldId, value) => {
    e.stopPropagation(); // Prevent dropdown from closing
    
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

  return (
    <div className="filter-bar" ref={dropdownRef}>
      {filterFields.map(field => {
        const fieldTags = getFieldTags(field);
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
                {fieldTags.length === 0 ? (
                  <div className="filter-empty">Aucune option disponible</div>
                ) : (
                  fieldTags.map(tag => (
                    <label 
                      key={tag.value} 
                      className="filter-option"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters[field.id]?.includes(tag.value) || false}
                        onChange={(e) => toggleFilter(e, field.id, tag.value)}
                      />
                      <span>{tag.label}</span>
                    </label>
                  ))
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
