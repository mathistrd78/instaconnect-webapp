import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/FilterBar.css';

const FilterBar = ({ activeFilters, onFilterChange }) => {
  const { getAllFields, contacts } = useApp();
  const [showDropdown, setShowDropdown] = useState(null);

  const filterableFields = getAllFields().filter(
    field => field.type === 'select' || field.type === 'radio'
  );

  const getFilterOptions = (field) => {
    if (field.type === 'radio' && field.options) {
      return field.options.map(opt => ({
        value: opt,
        label: opt,
        count: contacts.filter(c => c[field.id] === opt).length
      }));
    }

    if (field.type === 'select' && field.tags) {
      return field.tags.map(tag => ({
        value: tag.value,
        label: tag.label,
        count: contacts.filter(c => c[field.id] === tag.value).length
      }));
    }

    return [];
  };

  const toggleFilter = (fieldId, value) => {
    const current = activeFilters[fieldId] || [];
    const newFilters = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];

    onFilterChange({
      ...activeFilters,
      [fieldId]: newFilters.length > 0 ? newFilters : undefined
    });
  };

  const resetFilters = () => {
    onFilterChange({});
    setShowDropdown(null);
  };

  const hasActiveFilters = Object.values(activeFilters).some(
    f => f && f.length > 0
  );

  return (
    <div className="filter-bar">
      <div className="filter-chips">
        {filterableFields.map(field => {
          const activeCount = (activeFilters[field.id] || []).length;
          
          return (
            <div key={field.id} className="filter-chip-container">
              <button
                className={`filter-chip ${activeCount > 0 ? 'active' : ''}`}
                onClick={() => setShowDropdown(showDropdown === field.id ? null : field.id)}
              >
                <span>{field.label}</span>
                {activeCount > 0 && <span className="filter-badge">{activeCount}</span>}
                <span className="filter-arrow">▼</span>
              </button>

              {showDropdown === field.id && (
                <div className="filter-dropdown">
                  <div className="filter-dropdown-header">
                    <span>{field.label}</span>
                    <button
                      className="filter-dropdown-close"
                      onClick={() => setShowDropdown(null)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="filter-options">
                    {getFilterOptions(field).map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={(activeFilters[field.id] || []).includes(option.value)}
                          onChange={() => toggleFilter(field.id, option.value)}
                        />
                        <span className="filter-option-label">{option.label}</span>
                        <span className="filter-option-count">({option.count})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {hasActiveFilters && (
          <button className="filter-chip filter-reset" onClick={resetFilters}>
            ✕ Réinitialiser
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="filter-overlay"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  );
};

export default FilterBar;
