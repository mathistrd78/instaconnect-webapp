import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactModal from './ContactModal';
import '../styles/TopBar.css';

const TopBar = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleAddContact = () => {
    setShowModal(true);
  };

  const handleSaveContact = (contact) => {
    setShowModal(false);
  };

  const handleNewAnalysis = () => {
    alert('Fonctionnalité "Nouvelle analyse" à venir');
  };

  return (
    <>
      <div className="topbar">
        {/* Left: InstaConnect */}
        <div className="topbar-left">
          <span className="topbar-logo-text">InstaConnect</span>
        </div>

        {/* Right: Buttons */}
        <div className="topbar-right">
          <button
            className="topbar-btn-analyse"
            onClick={handleNewAnalysis}
            title="Nouvelle analyse Instagram"
          >
            📊 Nouvelle analyse
          </button>
          <button
            className="topbar-btn-contact"
            onClick={handleAddContact}
          >
            + Nouveau contact
          </button>
        </div>
      </div>

      {showModal && (
        <ContactModal
          contact={null}
          onClose={() => setShowModal(false)}
          onSave={handleSaveContact}
        />
      )}
    </>
  );
};

export default TopBar;
