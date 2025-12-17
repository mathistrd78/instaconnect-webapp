import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import ContactModal from '../components/ContactModal';
import '../styles/Calendar.css';

const CalendarPage = () => {
  const { contacts } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Get contacts with meetings
  const contactsWithMeetings = useMemo(() => {
    return contacts.filter(contact => contact.nextMeeting);
  }, [contacts]);

  // Get meetings for a specific date
  const getMeetingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return contactsWithMeetings.filter(contact => {
      if (!contact.nextMeeting) return false;
      const meetingDate = new Date(contact.nextMeeting).toISOString().split('T')[0];
      return meetingDate === dateStr;
    });
  };

  // Get meetings for selected date
  const selectedDateMeetings = useMemo(() => {
    return getMeetingsForDate(selectedDate);
  }, [selectedDate, contactsWithMeetings]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Previous month days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const meetings = getMeetingsForDate(date);
      days.push({
        day,
        date,
        hasMeeting: meetings.length > 0,
        meetingCount: meetings.length
      });
    }

    return days;
  }, [currentDate, contactsWithMeetings]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDayClick = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleContactClick = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedContact(null);
  };

  // Format Instagram username (fix double @@)
  const getInstagramDisplay = (username) => {
    if (!username) return null;
    return username.startsWith('@') ? username : `@${username}`;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-header">
        <h1>📅 Calendrier</h1>
        <p className="calendar-subtitle">
          Gérez vos rendez-vous et meetings
        </p>
      </div>

      <div className="calendar-layout">
        {/* Left: Calendar */}
        <div className="calendar-section">
          <div className="calendar-controls">
            <button className="calendar-btn prev" onClick={previousMonth}>
              ◀
            </button>
            <h2 className="calendar-title">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button className="calendar-btn next" onClick={nextMonth}>
              ▶
            </button>
          </div>

          <div className="calendar-grid">
            <div className="calendar-weekdays">
              {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>

            <div className="calendar-days">
              {calendarDays.map((dayInfo, index) => (
                <div
                  key={index}
                  className={`calendar-day ${!dayInfo.day ? 'empty' : ''} ${
                    isToday(dayInfo.date) ? 'today' : ''
                  } ${isSelectedDate(dayInfo.date) ? 'selected' : ''} ${
                    isPastDate(dayInfo.date) ? 'past' : ''
                  } ${dayInfo.hasMeeting ? 'has-meeting' : ''}`}
                  onClick={() => handleDayClick(dayInfo.date)}
                >
                  {dayInfo.day && (
                    <>
                      <span className="day-number">{dayInfo.day}</span>
                      {dayInfo.hasMeeting && (
                        <span className="meeting-dot"></span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Meetings list */}
        <div className="meetings-section">
          <div className="meetings-header">
            <h3>
              {selectedDate.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </h3>
            <span className="meetings-count">
              {selectedDateMeetings.length} RDV
            </span>
          </div>

          <div className="meetings-list">
            {selectedDateMeetings.length === 0 ? (
              <div className="empty-meetings">
                <span className="empty-icon">📭</span>
                <p>Aucun rendez-vous ce jour</p>
              </div>
            ) : (
              selectedDateMeetings.map(contact => (
                <div
                  key={contact.id}
                  className="meeting-card"
                  onClick={() => handleContactClick(contact)}
                >
                  <div className="meeting-avatar">
                    {contact.firstName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="meeting-details">
                    <div className="meeting-name">
                      {contact.firstName || 'Sans nom'}
                    </div>
                    {contact.instagram && (
                      <div className="meeting-instagram">
                        {getInstagramDisplay(contact.instagram)}
                      </div>
                    )}
                    {contact.notes && (
                      <div className="meeting-notes">
                        {contact.notes.substring(0, 60)}
                        {contact.notes.length > 60 && '...'}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showModal && selectedContact && (
        <ContactModal
          contact={selectedContact}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default CalendarPage;
