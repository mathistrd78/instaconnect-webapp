import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ContactModal from './ContactModal';
import '../styles/TopBar.css';

const TopBar = () => {
  const { currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleAddContact = () => {
    setShowModal(true);
  };

  const handleSaveContact = (contact) => {
    // Cette fonction sera gérée par le modal lui-même via le contexte
    setShowModal(false);
  };

  const handleNewAnalysis = () => {
    alert('Fonctionnalité "Nouvelle analyse" à venir');
  };

  return (
    <>
      <div className="topbar">
        <div className="topbar-left">
          <div className="app-name">InstaConnect</div>
        </div>

        <div className="topbar-right">
          <button className="btn-new-analysis" onClick={handleNewAnalysis}>
            📊 Nouvelle analyse
          </button>
          <button className="btn-add-contact" onClick={handleAddContact}>
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
