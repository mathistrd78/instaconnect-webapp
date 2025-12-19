import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();

  const handleNewAnalysis = () => {
    alert('Fonctionnalité "Nouvelle analyse" à venir');
  };

  return (
    <div className="topbar">
      {/* Left: InstaConnect */}
      <div className="topbar-left">
        <span className="topbar-logo-text">InstaConnect</span>
      </div>

      {/* Right: Button */}
      <div className="topbar-right">
        <button
          className="topbar-btn-analyse"
          onClick={handleNewAnalysis}
          title="Nouvelle analyse Instagram"
        >
          📊 Nouvelle analyse
        </button>
      </div>
    </div>
  );
};

export default TopBar;
