import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import '../styles/Stats.css';

const StatsPage = () => {
  const { contacts, getAllFields } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('relationType');

  const allFields = getAllFields();

  // Helper function to convert index to display value
  const getFieldDisplayValue = (field, value) => {
    if (value === undefined || value === null || value === '') {
      return 'Non renseigné';
    }

    if (field.type === 'select' && typeof value === 'number') {
      if (field.tags && field.tags[value]) {
        return field.tags[value].label || field.tags[value].value || field.tags[value];
      }
      return `Option ${value}`;
    }
    
    if (field.type === 'radio' && typeof value === 'number') {
      if (field.options && field.options[value]) {
        return field.options[value];
      }
      return `Option ${value}`;
    }
    
    if (field.type === 'select' && typeof value === 'string') {
      const tag = field.tags?.find(t => (t.value || t) === value);
      return tag ? (tag.label || tag.value || tag) : value;
    }

    if (field.type === 'radio' && typeof value === 'string') {
      return value;
    }
    
    return value;
  };

  // Get all categorizable fields (select, radio, checkbox)
  const categorizableFields = useMemo(() => {
    const fields = allFields.filter(field => 
      field.type === 'select' || field.type === 'radio' || field.type === 'checkbox'
    );
    
    // Add virtual "country" field
    fields.push({
      id: 'country',
      label: 'Pays',
      type: 'virtual'
    });
    
    return fields;
  }, [allFields]);

  // Set first field as active tab if exists
  React.useEffect(() => {
    if (categorizableFields.length > 0 && !activeTab) {
      setActiveTab(categorizableFields[0].id);
    }
  }, [categorizableFields, activeTab]);

  // Check if contact is complete
  const isContactComplete = (contact) => {
    const requiredFields = allFields.filter(f => f.required);
    return requiredFields.every(field => {
      const value = contact[field.id];
      return value !== undefined && value !== null && value !== '';
    });
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = contacts.length;
    const complete = contacts.filter(isContactComplete).length;
    const incomplete = total - complete;

    return { total, complete, incomplete };
  }, [contacts, allFields]);

  // Normalize country name
  const normalizeCountry = (country) => {
    const mapping = {
      'germany': 'Allemagne',
      'united states': 'États-Unis',
      'united states of america': 'États-Unis',
      'etats-unis d\'amerique': 'États-Unis',
      'usa': 'États-Unis',
      'uk': 'Royaume-Uni',
      'united kingdom': 'Royaume-Uni',
      'spain': 'Espagne',
      'italy': 'Italie',
      'france': 'France'
    };
    
    const lower = country.toLowerCase().trim();
    return mapping[lower] || country;
  };

  // Get distribution for a field (excluding undefined/null/empty)
  const getFieldDistribution = (fieldId) => {
    // Special case for country
    if (fieldId === 'country') {
      const distribution = {};
      let totalDefined = 0;

      contacts.forEach(contact => {
        let country = '';
        if (contact.location) {
          if (typeof contact.location === 'object' && contact.location.country) {
            country = contact.location.country;
          } else if (typeof contact.location === 'string' && contact.location.includes(',')) {
            country = contact.location.split(',').pop().trim();
          }
        }
        
        if (country) {
          const normalized = normalizeCountry(country);
          distribution[normalized] = (distribution[normalized] || 0) + 1;
          totalDefined++;
        }
      });

      const data = Object.entries(distribution).map(([label, count]) => ({
        label,
        count,
        percentage: totalDefined > 0 ? ((count / totalDefined) * 100).toFixed(1) : 0
      }));

      data.sort((a, b) => b.count - a.count);

      return { data, totalDefined };
    }

    // Regular field
    const field = allFields.find(f => f.id === fieldId);
    if (!field) return { data: [], totalDefined: 0 };

    const distribution = {};
    let totalDefined = 0;

    contacts.forEach(contact => {
      const value = contact[fieldId];
      if (value !== undefined && value !== null && value !== '') {
        const displayValue = getFieldDisplayValue(field, value);
        distribution[displayValue] = (distribution[displayValue] || 0) + 1;
        totalDefined++;
      }
    });

    const data = Object.entries(distribution).map(([label, count]) => ({
      label,
      count,
      percentage: totalDefined > 0 ? ((count / totalDefined) * 100).toFixed(1) : 0
    }));

    data.sort((a, b) => b.count - a.count);

    return { data, totalDefined };
  };

  // Colors for pie chart
  const colors = [
    '#E1306C', '#C13584', '#F77737', '#FCAF45', '#833AB4',
    '#FD1D1D', '#405DE6', '#5B51D8', '#C32AA3', '#F56040'
  ];

  const activeField = categorizableFields.find(f => f.id === activeTab);
  const { data: chartData, totalDefined } = activeField 
    ? getFieldDistribution(activeField.id) 
    : { data: [], totalDefined: 0 };

  // Calculate pie chart segments
  const createPieChart = (data) => {
    if (data.length === 0) return [];

    let currentAngle = -90;
    const segments = data.map((item, index) => {
      const percentage = parseFloat(item.percentage);
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      currentAngle = endAngle;

      return {
        ...item,
        startAngle,
        endAngle,
        color: colors[index % colors.length]
      };
    });

    return segments;
  };

  const pieSegments = createPieChart(chartData);

  // Create SVG path for pie segment
  const createArc = (startAngle, endAngle, radius = 100) => {
    const start = polarToCartesian(120, 120, radius, endAngle);
    const end = polarToCartesian(120, 120, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', 120, 120,
      'L', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const handleLegendClick = (displayLabel) => {
    if (!activeField) return;

    // Special case for country - navigate with country filter
    if (activeField.id === 'country') {
      const filters = { country: [displayLabel] };
      navigate('/app/contacts', { state: { filters } });
      return;
    }

    // Find the original value (index or string) that matches this display label
    const matchingContact = contacts.find(contact => {
      const value = contact[activeField.id];
      if (value === undefined || value === null || value === '') return false;
      return getFieldDisplayValue(activeField, value) === displayLabel;
    });

    if (matchingContact) {
      const originalValue = matchingContact[activeField.id];
      const filters = { [activeField.id]: [originalValue] };
      navigate('/app/contacts', { state: { filters } });
    }
  };

  return (
    <div className="stats-page">
      <div className="stats-header">
        <h1>📊 Statistiques</h1>
        <p className="stats-subtitle">Visualisez vos données de contacts</p>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total contacts</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{stats.complete}</div>
            <div className="stat-label">Profils complets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{stats.incomplete}</div>
            <div className="stat-label">Profils incomplets</div>
          </div>
        </div>
      </div>

      {categorizableFields.length > 0 && (
        <>
          <div className="stats-tabs">
            {categorizableFields.map(field => (
              <button
                key={field.id}
                className={`stats-tab ${activeTab === field.id ? 'active' : ''}`}
                onClick={() => setActiveTab(field.id)}
              >
                {field.label}
              </button>
            ))}
          </div>

          <div className="stats-chart-section">
            {chartData.length === 0 ? (
              <div className="no-data">
                <span className="no-data-icon">📊</span>
                <p>Aucune donnée disponible pour ce champ</p>
              </div>
            ) : (
              <div className="chart-layout">
                <div className="chart-legend">
                  {chartData.map((item, index) => (
                    <div 
                      key={index} 
                      className="legend-item"
                      onClick={() => handleLegendClick(item.label)}
                    >
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <div className="legend-info">
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-value">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pie-chart-container">
                  <svg viewBox="0 0 240 240" className="pie-chart">
                    {pieSegments.map((segment, index) => (
                      <path
                        key={index}
                        d={createArc(segment.startAngle, segment.endAngle)}
                        fill={segment.color}
                        className="pie-segment"
                      />
                    ))}
                    <circle cx="120" cy="120" r="60" fill="var(--surface)" />
                    <text
                      x="120" y="115"
                      textAnchor="middle"
                      fontSize="28"
                      fontWeight="700"
                      fill="var(--text-primary)"
                    >
                      {totalDefined}
                    </text>
                    <text
                      x="120" y="135"
                      textAnchor="middle"
                      fontSize="14"
                      fill="var(--text-secondary)"
                    >
                      contacts
                    </text>
                  </svg>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPage;
