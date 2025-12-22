import React, { useState, useEffect, useRef } from 'react';
import { cityAutocomplete } from '../utils/cityAutocomplete';
import '../styles/CityAutocomplete.css';

const CityAutocomplete = ({ value, onChange, contacts, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentLocations, setRecentLocations] = useState([]);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  // Initialize input value from prop
  useEffect(() => {
    if (value) {
      if (typeof value === 'object') {
        setInputValue(value.displayName || '');
      } else {
        setInputValue(value);
      }
    } else {
      setInputValue('');
    }
  }, [value]);

  // Load recent locations
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const recent = cityAutocomplete.getRecentLocations(contacts);
      setRecentLocations(recent);
    }
  }, [contacts]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    if (inputValue.trim().length === 0 && recentLocations.length > 0) {
      setResults(recentLocations);
      setIsOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);

    if (query.trim().length < 2) {
      setIsOpen(false);
      setResults([]);
      return;
    }

    setLoading(true);
    setIsOpen(true);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      const cities = await cityAutocomplete.searchCities(query);
      setResults(cities);
      setLoading(false);
    }, 300);
  };

  const handleSelect = (location) => {
    setInputValue(location.displayName);
    setIsOpen(false);
    
    // Call onChange with full location object
    onChange(location);
  };

  return (
    <div className="city-autocomplete" ref={containerRef}>
      <input
        type="text"
        className="form-input"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder || 'Ex: Paris, France'}
      />

      {isOpen && (
        <div className="city-dropdown">
          {loading ? (
            <div className="city-dropdown-item loading">
              🔍 Recherche...
            </div>
          ) : results.length === 0 ? (
            <div className="city-dropdown-item no-results">
              Aucune ville trouvée
            </div>
          ) : (
            <>
              {inputValue.trim().length === 0 && (
                <div className="city-dropdown-header">
                  Dernières localisations
                </div>
              )}
              {results.map((location, index) => (
                <div
                  key={index}
                  className="city-dropdown-item"
                  onClick={() => handleSelect(location)}
                >
                  <span className="city-flag">{location.flag}</span>
                  <span className="city-name">{location.displayName}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;
