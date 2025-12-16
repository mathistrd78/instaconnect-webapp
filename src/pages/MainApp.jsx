import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import ContactsPage from './ContactsPage';
import StatsPage from './StatsPage';
import ProfilePage from './ProfilePage';
import BottomNav from '../components/BottomNav';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/MainApp.css';

const MainApp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { loading } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/auth', { replace: true });
    }
  };

  const getCurrentSection = () => {
    const path = location.pathname;
    if (path.includes('/contacts')) return 'contacts';
    if (path.includes('/stats')) return 'stats';
    if (path.includes('/profile')) return 'profile';
    return 'contacts';
  };

  if (loading) {
    return <LoadingSpinner text="Chargement de vos contacts..." />;
  }

  return (
    <div className="main-app">
      {/* User Menu */}
      <div className="user-menu">
        <div 
          className="user-menu-icon" 
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          👤
        </div>
        {showUserMenu && (
          <div className="user-menu-dropdown">
            <div className="user-menu-email">{currentUser?.email}</div>
            <button className="user-menu-item" onClick={handleLogout}>
              🚪 Déconnexion
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="app-content">
        <Routes>
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/" element={<ContactsPage />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      <BottomNav currentSection={getCurrentSection()} />

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="user-menu-overlay" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default MainApp;
