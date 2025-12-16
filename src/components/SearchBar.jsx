import React from 'react';
import '../styles/SearchBar.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-input"
        placeholder="🔍 Rechercher..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
