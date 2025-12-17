import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/Stats.css';

const StatsPage = () => {
  const { contacts, getAllFields } = useApp();

  const stats = useMemo(() => {
    const total = contacts.length;
    
    // Count by gender
    const genderCounts = contacts.reduce((acc, contact) => {
      const gender = contact.gender || 'Non spécifié';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    // Count by relation type
    const relationCounts = contacts.reduce((acc, contact) => {
      const relation = contact.relationType || 'Non spécifié';
      acc[relation] = (acc[relation] || 0) + 1;
      return acc;
    }, {});

    // Count by meeting place
    const meetingCounts = contacts.reduce((acc, contact) => {
      const place = contact.meetingPlace || 'Non spécifié';
      acc[place] = (acc[place] || 0) + 1;
      return acc;
    }, {});

    // Count by discussion status
    const statusCounts = contacts.reduce((acc, contact) => {
      const status = contact.discussionStatus || 'Non spécifié';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Count complete profiles
    const allFields = getAllFields();
    const completeProfiles = contacts.filter(contact => {
      const requiredFields = allFields.filter(f => f.required);
      return requiredFields.every(field => {
        const value = contact[field.id];
        return value !== undefined && value !== null && value !== '';
      });
    }).length;

    return {
      total,
      genderCounts,
      relationCounts,
      meetingCounts,
      statusCounts,
      completeProfiles,
      incompleteProfiles: total - completeProfiles
    };
  }, [contacts, getAllFields]);

  const renderStatCard = (title, value, subtitle = null) => (
    <div className="stat-card">
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{title}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );

  const renderBreakdown = (title, counts) => {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="stats-breakdown">
        <h3>{title}</h3>
        <div className="breakdown-items">
          {Object.entries(counts).map(([key, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="breakdown-item">
                <div className="breakdown-label">
                  <span className="breakdown-name">{key}</span>
                  <span className="breakdown-count">{count}</span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="breakdown-percentage">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h2>📊 Statistiques</h2>
      </div>

      <div className="stats-content">
        {/* Global Stats */}
        <div className="stats-cards-grid">
          {renderStatCard('Total contacts', stats.total)}
          {renderStatCard('Profils complets', stats.completeProfiles)}
          {renderStatCard('Profils incomplets', stats.incompleteProfiles)}
        </div>

        {/* Detailed Breakdowns */}
        {stats.total > 0 && (
          <>
            {Object.keys(stats.genderCounts).length > 0 && 
              renderBreakdown('Répartition par sexe', stats.genderCounts)}
            
            {Object.keys(stats.relationCounts).length > 0 && 
              renderBreakdown('Répartition par type de relation', stats.relationCounts)}
            
            {Object.keys(stats.meetingCounts).length > 0 && 
              renderBreakdown('Répartition par lieu de rencontre', stats.meetingCounts)}
            
            {Object.keys(stats.statusCounts).length > 0 && 
              renderBreakdown('Répartition par statut de discussion', stats.statusCounts)}
          </>
        )}

        {stats.total === 0 && (
          <div className="empty-stats">
            <div className="empty-stats-icon">📊</div>
            <div className="empty-stats-text">
              Aucune donnée disponible.<br />
              Ajoutez des contacts pour voir vos statistiques !
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;
