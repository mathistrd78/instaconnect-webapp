import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import '../styles/Calendar.css';

const CalendarPage = () => {
  const { contacts } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Get meetings by date
  const meetingsByDate = useMemo(() => {
    const meetings = {};
    contacts.forEach(contact => {
      if (contact.meetingDate) {
        const date = contact.meetingDate; // Format: YYYY-MM-DD
        if (!meetings[date]) {
          meetings[date] = [];
        }
        meetings[date].push(contact);
      }
    });
    return meetings;
  }, [contacts]);

  // Calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const selectDate = (day) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateString);
  };

  const renderDays = () => {
    const days = [];

    // Empty days before month starts
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDateObj = new Date(year, month, day);
      currentDateObj.setHours(0, 0, 0, 0);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const hasMeeting = meetingsByDate[dateString] && meetingsByDate[dateString].length > 0;
      const isToday = currentDateObj.getTime() === today.getTime();
      const isPast = currentDateObj < today;
      const isSelected = selectedDate === dateString;

      let classes = 'calendar-day';
      if (hasMeeting) classes += ' has-meeting';
      if (isToday) classes += ' today';
      if (isPast) classes += ' past';
      if (isSelected) classes += ' selected';

      days.push(
        <div
          key={day}
          className={classes}
          onClick={() => selectDate(day)}
        >
          <span className="day-number">{day}</span>
          {hasMeeting && (
            <div className="meeting-indicator">
              {meetingsByDate[dateString].length}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const selectedDateMeetings = selectedDate ? meetingsByDate[selectedDate] || [] : [];

  return (
    <div className="calendar-page">
      <div className="calendar-header-page">
        <h1>📅 Calendrier des rendez-vous</h1>
        <p className="calendar-subtitle">
          Gérez vos rendez-vous avec vos contacts
        </p>
      </div>

      <div className="calendar-container">
        {/* Calendar */}
        <div className="calendar-widget">
          <div className="calendar-controls">
            <button className="calendar-nav-btn" onClick={previousMonth}>◀</button>
            <h3 className="calendar-month-year">{monthNames[month]} {year}</h3>
            <button className="calendar-nav-btn" onClick={nextMonth}>▶</button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              <div className="weekday">Lun</div>
              <div className="weekday">Mar</div>
              <div className="weekday">Mer</div>
              <div className="weekday">Jeu</div>
              <div className="weekday">Ven</div>
              <div className="weekday">Sam</div>
              <div className="weekday">Dim</div>
            </div>
            <div className="calendar-days">
              {renderDays()}
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="meetings-panel">
          {selectedDate ? (
            <>
              <h3 className="meetings-panel-title">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
              
              {selectedDateMeetings.length === 0 ? (
                <div className="no-meetings">
                  <div className="no-meetings-icon">📭</div>
                  <p>Aucun rendez-vous ce jour-là</p>
                </div>
              ) : (
                <div className="meetings-list">
                  {selectedDateMeetings.map(contact => (
                    <div key={contact.id} className="meeting-item">
                      <div className="meeting-avatar">
                        {contact.firstName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="meeting-info">
                        <div className="meeting-name">{contact.firstName}</div>
                        <div className="meeting-instagram">@{contact.instagram}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-date-selected">
              <div className="no-date-icon">📅</div>
              <p>Sélectionnez une date pour voir les rendez-vous</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
