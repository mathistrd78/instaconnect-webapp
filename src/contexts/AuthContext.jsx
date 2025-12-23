import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  // Initialize auth persistence - SESSION pour se déconnecter à la fermeture
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        console.log('✅ Firebase persistence set to SESSION (expires when tab/browser closes)');
      })
      .catch((error) => {
        console.error('❌ Error setting persistence:', error);
      });
  }, []);

  // Fonction de logout
  const handleLogout = useCallback(async () => {
    try {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      localStorage.setItem('justLoggedOut', 'true');
      await signOut(auth);
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // Reset inactivity timer - useCallback pour stabiliser la référence
  const resetInactivityTimer = useCallback(() => {
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      console.log('⏱️ 10 minutes of inactivity - logging out');
      handleLogout();
    }, INACTIVITY_TIMEOUT);

    // Debug: confirmer que le timer est réinitialisé
    console.log('🔄 Inactivity timer reset - will logout in 10 minutes if no activity');
  }, [INACTIVITY_TIMEOUT, handleLogout]);

  // Setup activity listeners
  useEffect(() => {
    if (currentUser) {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      console.log('✅ Activity listeners attached');
      
      events.forEach(event => {
        document.addEventListener(event, resetInactivityTimer, true);
      });

      // Initialiser le timer au démarrage
      resetInactivityTimer();

      return () => {
        console.log('🧹 Cleaning up activity listeners');
        events.forEach(event => {
          document.removeEventListener(event, resetInactivityTimer, true);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
          inactivityTimerRef.current = null;
        }
      };
    }
  }, [currentUser, resetInactivityTimer]);

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        console.log('✅ User logged in:', user.email);
      } else {
        console.log('❌ No user logged in');
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Signup successful:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Signup error:', error);
      let errorMessage = 'Erreur lors de l\'inscription';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Cet email est déjà utilisé';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mot de passe trop faible (min. 6 caractères)';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Login successful:', userCredential.user.email);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('❌ Login error:', error);
      let errorMessage = 'Erreur de connexion';
      
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte a été désactivé';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Trop de tentatives. Réessayez plus tard';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Password reset error:', error);
      let errorMessage = 'Erreur lors de l\'envoi de l\'email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte associé à cet email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email invalide';
          break;
        default:
          errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    signup,
    login,
    logout: handleLogout,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
