import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ContactsPage from './ContactsPage';
import CalendarPage from './CalendarPage';
import StatsPage from './StatsPage';
import TagsPage from './TagsPage';
import FieldsPage from './FieldsPage';
import ProfilePage from './ProfilePage';
import AnalysePage from './AnalysePage';
import UnfollowersPage from './UnfollowersPage';
import '../styles/MainApp.css';

const MainApp = () => {
  return (
    <div className="main-app-web">
      <Sidebar />
      <TopBar />
      
      <div className="main-content-area">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/app/contacts" replace />} />
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/calendrier" element={<CalendarPage />} />
            <Route path="/statistiques" element={<StatsPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/champs" element={<FieldsPage />} />
            <Route path="/parametres" element={<ProfilePage />} />
            <Route path="/analyse" element={<AnalysePage />} />
            <Route path="unfollowers" element={<UnfollowersPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainApp;
