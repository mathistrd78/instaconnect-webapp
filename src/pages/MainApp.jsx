import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ContactsPage from './ContactsPage';
import CalendarPage from './CalendarPage';
import StatsPage from './StatsPage';
import TagsPage from './TagsPage';
import FieldsPage from './FieldsPage';
import ProfilePage from './ProfilePage';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/MainApp.css';

const MainApp = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth', { replace: true });
    }
  }, [currentUser, navigate]);

  if (loading) {
    return <LoadingSpinner text="Chargement de vos contacts..." />;
  }

  return (
    <div className="main-app-web">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Top Bar */}
        <TopBar onSearch={setSearchQuery} />

        {/* Page Content */}
        <div className="page-content">
          <Routes>
            <Route path="/contacts" element={<ContactsPage searchQuery={searchQuery} />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/fields" element={<FieldsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<ContactsPage searchQuery={searchQuery} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
