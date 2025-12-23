import React, { useState, useEffect, useRef } from 'react';
import { cityAutocomplete } from '../utils/cityAutocomplete';
import '../styles/CityAutocomplete.css';

const RECENT_LOCATIONS_KEY = 'instaconnect_recent_locations';
const MAX_RECENT = 5;

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

  // Load recent locations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('📦 Loaded recent locations from localStorage:', parsed);
        setRecentLocations(parsed);
      }
    } catch (error) {
      console.error('❌ Error loading recent locations:', error);
    }
  }, []);

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
      // Si moins de 2 caractères, afficher les récentes
      if (query.trim().length === 0 && recentLocations.length > 0) {
        setResults(recentLocations);
        setIsOpen(true);
      } else {
        setIsOpen(false);
        setResults([]);
      }
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

  const saveRecentLocation = (location) => {
    try {
      // Créer une copie pour éviter les mutations
      const newRecent = [...recentLocations];
      
      // Retirer l'élément s'il existe déjà (pour le mettre en premier)
      const existingIndex = newRecent.findIndex(
        loc => loc.displayName === location.displayName
      );
      if (existingIndex !== -1) {
        newRecent.splice(existingIndex, 1);
      }
      
      // Ajouter en première position
      newRecent.unshift(location);
      
      // Limiter à MAX_RECENT éléments
      const limited = newRecent.slice(0, MAX_RECENT);
      
      // Sauvegarder dans localStorage
      localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(limited));
      
      // Mettre à jour l'état
      setRecentLocations(limited);
      
      console.log('✅ Saved recent location:', location.displayName);
      console.log('📋 Recent locations:', limited.map(l => l.displayName));
    } catch (error) {
      console.error('❌ Error saving recent location:', error);
    }
  };

  const handleSelect = (location) => {
    setInputValue(location.displayName);
    setIsOpen(false);
    
    // 🎯 Sauvegarder dans les récentes
    saveRecentLocation(location);
    
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
              {inputValue.trim().length === 0 && recentLocations.length > 0 && (
                <div className="city-dropdown-header">
                  📍 Dernières localisations
                </div>
              )}
              {results.map((location, index) => (
                <div
                  key={`${location.displayName}-${index}`}
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
