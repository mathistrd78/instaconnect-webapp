import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { currentUser, login, signup, resetPassword } = useAuth();
  const [formType, setFormType] = useState('login'); // 'login', 'signup', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/app/contacts', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setMessage({ text: '⚠️ Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const result = await login(email, password);
    
    if (result.success) {
      setMessage({ text: '✅ Connexion réussie !', type: 'success' });
      setTimeout(() => {
        navigate('/app/contacts', { replace: true });
      }, 500);
    } else {
      setMessage({ text: `❌ ${result.error}`, type: 'error' });
    }
    
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !passwordConfirm) {
      setMessage({ text: '⚠️ Veuillez remplir tous les champs', type: 'error' });
      return;
    }

    if (password !== passwordConfirm) {
      setMessage({ text: '⚠️ Les mots de passe ne correspondent pas', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setMessage({ text: '⚠️ Le mot de passe doit contenir au moins 6 caractères', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const result = await signup(email, password);
    
    if (result.success) {
      setMessage({ text: '✅ Compte créé avec succès !', type: 'success' });
      setTimeout(() => {
        navigate('/app/contacts', { replace: true });
      }, 500);
    } else {
      setMessage({ text: `❌ ${result.error}`, type: 'error' });
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage({ text: '⚠️ Veuillez entrer votre email', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    const result = await resetPassword(email);
    
    if (result.success) {
      setMessage({ text: '✅ Email de réinitialisation envoyé !', type: 'success' });
      setTimeout(() => {
        setFormType('login');
        setMessage({ text: '', type: '' });
      }, 2000);
    } else {
      setMessage({ text: `❌ ${result.error}`, type: 'error' });
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">📱 InstaConnect</div>
        <div className="auth-subtitle">Votre CRM Instagram</div>

        {formType === 'login' && (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Connexion</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="auth-input"
              autoComplete="email"
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="auth-input"
              autoComplete="current-password"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <div className="auth-link" onClick={() => !loading && setFormType('signup')}>
              Pas de compte ? S'inscrire
            </div>
            <div className="auth-link" onClick={() => !loading && setFormType('reset')}>
              Mot de passe oublié ?
            </div>
          </form>
        )}

        {formType === 'signup' && (
          <form className="auth-form" onSubmit={handleSignup}>
            <h2>Inscription</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="auth-input"
              autoComplete="email"
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe (min. 6 caractères)"
              className="auth-input"
              autoComplete="new-password"
              disabled={loading}
            />
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirmer le mot de passe"
              className="auth-input"
              autoComplete="new-password"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
            <div className="auth-link" onClick={() => !loading && setFormType('login')}>
              Déjà un compte ? Se connecter
            </div>
          </form>
        )}

        {formType === 'reset' && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <h2>Réinitialiser</h2>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="auth-input"
              autoComplete="email"
              disabled={loading}
            />
            <button 
              type="submit" 
              className="auth-btn auth-btn-primary"
              disabled={loading}
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
            <div className="auth-link" onClick={() => !loading && setFormType('login')}>
              Retour à la connexion
            </div>
          </form>
        )}

        {message.text && (
          <div className={`auth-message auth-message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
