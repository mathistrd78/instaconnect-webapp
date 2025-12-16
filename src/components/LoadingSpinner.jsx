import React from 'react';
import '../styles/Loading.css';

const LoadingSpinner = ({ text = 'Chargement...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
