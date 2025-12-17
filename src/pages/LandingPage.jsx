import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Landing.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // If user is already logged in, skip landing page
    if (currentUser) {
      navigate('/app/contacts', { replace: true });
      return;
    }

    // Check if just logged out
    const justLoggedOut = localStorage.getItem('justLoggedOut') === 'true';
    if (justLoggedOut) {
      localStorage.removeItem('justLoggedOut');
      navigate('/auth', { replace: true });
      return;
    }

    // Show landing page animation then navigate to auth
    const timer = setTimeout(() => {
      navigate('/auth', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentUser, navigate]);

  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">
          {'InstaConnect'.split('').map((letter, index) => (
            <span key={index} className="landing-letter" style={{ animationDelay: `${index * 0.1}s` }}>
              {letter}
            </span>
          ))}
        </div>
        <div className="landing-subtitle">Votre CRM Instagram</div>
      </div>
    </div>
  );
};

export default LandingPage;
