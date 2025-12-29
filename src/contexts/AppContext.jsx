import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  getDoc,
  deleteDoc,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const DEFAULT_FIELDS = [
  {
    id: 'firstName',
    type: 'text',
    label: 'Prénom',
    required: true,
    order: 0
  },
  {
    id: 'instagram',
    type: 'text',
    label: 'Instagram',
    required: true,
    order: 1
  },
  {
    id: 'relationType',
    type: 'select',
    label: 'Type de relation',
    required: true,
    order: 2,
    tags: []
  },
  {
    id: 'meetingPlace',
    type: 'select',
    label: 'Lieu de rencontre',
    required: true,
    order: 3,
    tags: []
  },
  {
    id: 'discussionStatus',
    type: 'select',
    label: 'Statut de discussion',
    required: true,
    order: 4,
    tags: []
  },
  {
    id: 'gender',
    type: 'radio',
    label: 'Sexe',
    required: true,
    order: 5,
    options: ['Homme', 'Femme', 'Autre']
  },
  {
    id: 'location',
    type: 'text',
    label: 'Localisation',
    required: false,
    order: 7
  },
  {
    id: 'birthDate',
    type: 'date',
    label: 'Anniversaire',
    required: false,
    order: 8
  },
  {
    id: 'nextMeeting',
    type: 'date',
    label: 'Prochain RDV',
    required: false,
    order: 9
  },
  {
    id: 'notes',
    type: 'textarea',
    label: 'Notes personnelles',
    required: false,
    order: 10
  }
];

// 🔑 Clés localStorage
const STORAGE_KEYS = {
  CONTACTS: 'instaconnect_contacts',
  METADATA: 'instaconnect_metadata',
  LAST_SYNC: 'instaconnect_last_sync'
};

export const AppProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [defaultFields, setDefaultFields] = useState(DEFAULT_FIELDS);
  const [customFields, setCustomFields] = useState([]);
  const [customTags, setCustomTags] = useState({
    relationType: [],
    meetingPlace: [],
    discussionStatus: []
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === null ? true : saved === 'true';
  });

  // 🎯 Refs pour debouncing et tracking
  const saveTimeoutRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const pendingChangesRef = useRef({
    contacts: new Set(),
    metadata: false
  });

  // ============================================
  // 📦 LOCALSTORAGE HELPERS
  // ============================================

  const saveToLocalStorage = useCallback((key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('❌ localStorage save failed:', error);
    }
  }, []);

  const loadFromLocalStorage = useCallback((key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('❌ localStorage load failed:', error);
      return defaultValue;
    }
  }, []);

  // ============================================
  // 📥 LOAD DATA (with localStorage cache)
  // ============================================

  const loadUserData = useCallback(async (forceRefresh = false) => {
    if (!currentUser) return;
    if (hasLoadedRef.current && !forceRefresh) {
      console.log('✅ Data already loaded, skipping...');
      return;
    }

    setLoading(true);
    const userId = currentUser.uid;

    try {
      // 1️⃣ CHARGER DEPUIS LOCALSTORAGE D'ABORD (instantané)
      if (!forceRefresh) {
        console.log('📦 Loading from localStorage first...');
        const cachedContacts = loadFromLocalStorage(`${STORAGE_KEYS.CONTACTS}_${userId}`);
        const cachedMetadata = loadFromLocalStorage(`${STORAGE_KEYS.METADATA}_${userId}`);

        if (cachedContacts) {
          console.log(`✅ Loaded ${cachedContacts.length} contacts from cache`);
          setContacts(cachedContacts);
        }

        if (cachedMetadata) {
          console.log('✅ Loaded metadata from cache');
          if (cachedMetadata.customTags) setCustomTags(cachedMetadata.customTags);
          if (cachedMetadata.customFields) setCustomFields(cachedMetadata.customFields);
          if (cachedMetadata.defaultFields) {
            const fieldsWithTags = cachedMetadata.defaultFields.map(field => {
              if (field.type === 'select' && cachedMetadata.customTags?.[field.id]) {
                return { ...field, tags: cachedMetadata.customTags[field.id] };
              }
              return field;
            });
            setDefaultFields(fieldsWithTags);
          }
        }
      }

      // 2️⃣ SYNCHRO FIREBASE EN ARRIÈRE-PLAN (seulement si nécessaire)
      const lastSync = loadFromLocalStorage(`${STORAGE_KEYS.LAST_SYNC}_${userId}`, 0);
      const now = Date.now();
      const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

      if (forceRefresh || (now - lastSync) > SYNC_INTERVAL) {
        console.log('🔄 Syncing with Firebase...');

        // Load metadata
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.customTags) setCustomTags(userData.customTags);
          if (userData.customFields) setCustomFields(userData.customFields);
          
          if (userData.defaultFields) {
            const fieldsWithTags = userData.defaultFields.map(field => {
              if (field.type === 'select' && userData.customTags?.[field.id]) {
                return { ...field, tags: userData.customTags[field.id] };
              }
              return field;
            });
            setDefaultFields(fieldsWithTags);
          } else if (userData.customTags) {
            const fieldsWithTags = DEFAULT_FIELDS.map(field => {
              if (field.type === 'select' && userData.customTags[field.id]) {
                return { ...field, tags: userData.customTags[field.id] };
              }
              return field;
            });
            setDefaultFields(fieldsWithTags);
          }

          // Sauvegarder metadata dans cache
          saveToLocalStorage(`${STORAGE_KEYS.METADATA}_${userId}`, userData);
        }

        // 3️⃣ SETUP REALTIME LISTENER (onSnapshot) - 1 seule fois
        if (!unsubscribeRef.current) {
          console.log('👂 Setting up realtime listener...');
          const contactsRef = collection(db, 'users', userId, 'contacts');
          
          unsubscribeRef.current = onSnapshot(
            contactsRef,
            (snapshot) => {
              const contactsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              
              console.log(`✅ Realtime update: ${contactsData.length} contacts`);
              setContacts(contactsData);
              
              // Mettre à jour cache
              saveToLocalStorage(`${STORAGE_KEYS.CONTACTS}_${userId}`, contactsData);
            },
            (error) => {
              console.error('❌ Realtime listener error:', error);
            }
          );
        }

        // Marquer dernière synchro
        saveToLocalStorage(`${STORAGE_KEYS.LAST_SYNC}_${userId}`, now);
      }

      hasLoadedRef.current = true;
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, loadFromLocalStorage, saveToLocalStorage]);

  // ============================================
  // 💾 SAVE DATA (with debouncing) - 🛡️ VERSION SÉCURISÉE
  // ============================================

  const debouncedSave = useCallback(() => {
    if (!currentUser) return;

    // Annuler la sauvegarde précédente
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Planifier nouvelle sauvegarde après 2 secondes
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const userId = currentUser.uid;
        const batch = writeBatch(db);
        let hasChanges = false;

        // Sauvegarder seulement les contacts modifiés
        if (pendingChangesRef.current.contacts.size > 0) {
          console.log(`💾 Saving ${pendingChangesRef.current.contacts.size} modified contacts...`);
          
          pendingChangesRef.current.contacts.forEach(contactId => {
            const contact = contacts.find(c => c.id === contactId);
            if (contact) {
              const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
              batch.set(contactRef, contact);
              hasChanges = true;
            }
          });

          pendingChangesRef.current.contacts.clear();
        }

        // 🛡️ SAUVEGARDER METADATA AVEC updateDoc au lieu de setDoc
        if (pendingChangesRef.current.metadata) {
          console.log('💾 Saving metadata (SAFE MODE)...');
          const userRef = doc(db, 'users', userId);
          
          // 🛡️ UTILISER updateDoc pour NE TOUCHER QUE les champs metadata
          batch.update(userRef, {
            customTags,
            customFields,
            defaultFields
          });
          
          hasChanges = true;

          // Mettre à jour cache metadata
          const cacheData = { customTags, customFields, defaultFields };
          saveToLocalStorage(`${STORAGE_KEYS.METADATA}_${userId}`, cacheData);
          pendingChangesRef.current.metadata = false;
        }

        if (hasChanges) {
          await batch.commit();
          console.log('✅ Data saved to Firebase (SAFE MODE)');
        }
      } catch (error) {
        console.error('❌ Error saving to Firebase:', error);
      }
    }, 2000); // 2 secondes de debounce
  }, [currentUser, contacts, customTags, customFields, defaultFields, saveToLocalStorage]);

  // ============================================
  // 🔧 CRUD OPERATIONS
  // ============================================

  const addContact = useCallback(async (contact) => {
    const newContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    setContacts(prev => {
      const updated = [...prev, newContact];
      // Mettre à jour cache immédiatement
      if (currentUser) {
        saveToLocalStorage(`${STORAGE_KEYS.CONTACTS}_${currentUser.uid}`, updated);
      }
      return updated;
    });

    // Marquer pour sauvegarde
    pendingChangesRef.current.contacts.add(newContact.id);
    debouncedSave();

    return newContact;
  }, [currentUser, debouncedSave, saveToLocalStorage]);

  const updateContact = useCallback(async (contactId, updates) => {
    setContacts(prev => {
      const updated = prev.map(c =>
        c.id === contactId ? { ...c, ...updates } : c
      );
      // Mettre à jour cache immédiatement
      if (currentUser) {
        saveToLocalStorage(`${STORAGE_KEYS.CONTACTS}_${currentUser.uid}`, updated);
      }
      return updated;
    });

    // Marquer pour sauvegarde
    pendingChangesRef.current.contacts.add(contactId);
    debouncedSave();
  }, [currentUser, debouncedSave, saveToLocalStorage]);

  const deleteContact = useCallback(async (contactId) => {
    setContacts(prev => {
      const updated = prev.filter(c => c.id !== contactId);
      // Mettre à jour cache immédiatement
      if (currentUser) {
        saveToLocalStorage(`${STORAGE_KEYS.CONTACTS}_${currentUser.uid}`, updated);
      }
      return updated;
    });
    
    // Supprimer immédiatement de Firebase
    if (currentUser) {
      const contactRef = doc(db, 'users', currentUser.uid, 'contacts', contactId);
      await deleteDoc(contactRef);
      console.log('✅ Contact deleted from Firebase');
    }
  }, [currentUser, saveToLocalStorage]);

  const deleteMultipleContacts = useCallback(async (contactIds) => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      const batch = writeBatch(db);

      contactIds.forEach(contactId => {
        const contactRef = doc(db, 'users', userId, 'contacts', contactId);
        batch.delete(contactRef);
      });

      await batch.commit();

      setContacts(prev => {
        const updated = prev.filter(c => !contactIds.includes(c.id));
        // Mettre à jour cache immédiatement
        saveToLocalStorage(`${STORAGE_KEYS.CONTACTS}_${userId}`, updated);
        return updated;
      });

      console.log(`✅ Deleted ${contactIds.length} contacts`);
    } catch (error) {
      console.error('❌ Error deleting multiple contacts:', error);
      throw error;
    }
  }, [currentUser, saveToLocalStorage]);

  // 🛡️ FONCTION SAVECONTACTS SÉCURISÉE - Pour FieldsPage drag & drop
  const saveContacts = useCallback(async (contactsToSave = null, saveMetadata = false, explicitMetadata = null) => {
    if (!currentUser) return;

    const userId = currentUser.uid;

    try {
      const batch = writeBatch(db);
      let operationsCount = 0;

      // Sauvegarder contacts si fournis
      if (contactsToSave) {
        const contactsArray = Array.isArray(contactsToSave) ? contactsToSave : [contactsToSave];
        contactsArray.forEach(contact => {
          const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
          batch.set(contactRef, contact);
          operationsCount++;
        });
      }

      // 🛡️ SAUVEGARDER METADATA DE MANIÈRE SÉCURISÉE
      if (saveMetadata) {
        const userRef = doc(db, 'users', userId);
        const metadataToSave = explicitMetadata || {
          customTags,
          customFields,
          defaultFields
        };
        
        // 🛡️ UTILISER update au lieu de set pour préserver les autres champs
        batch.update(userRef, metadataToSave);
        operationsCount++;

        // 🎯 Mettre à jour les états React avec les nouvelles données
        if (explicitMetadata) {
          console.log('🔄 Updating React states with new metadata...');
          
          if (explicitMetadata.defaultFields) {
            setDefaultFields(explicitMetadata.defaultFields);
          }
          
          if (explicitMetadata.customFields) {
            setCustomFields(explicitMetadata.customFields);
          }
          
          if (explicitMetadata.customTags) {
            setCustomTags(explicitMetadata.customTags);
          }

          // Mettre à jour le cache localStorage (seulement metadata)
          saveToLocalStorage(`${STORAGE_KEYS.METADATA}_${userId}`, metadataToSave);
        }
      }

      if (operationsCount > 0) {
        await batch.commit();
        console.log(`✅ ${operationsCount} operation(s) saved to Firestore (SAFE MODE)`);
      }
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
      throw error;
    }
  }, [currentUser, customTags, customFields, defaultFields, saveToLocalStorage]);

  // Fonction pour forcer la sauvegarde immédiate
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    await debouncedSave();
  }, [debouncedSave]);

  // ============================================
  // 🎨 HELPERS
  // ============================================

  const getAllFields = useCallback(() => {
    return [...defaultFields, ...customFields].sort((a, b) => a.order - b.order);
  }, [defaultFields, customFields]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('darkMode', newMode.toString());
      return newMode;
    });
  }, []);

  // ============================================
  // 🎯 EFFECTS
  // ============================================

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Load data when user logs in (UNE SEULE FOIS)
  useEffect(() => {
    if (currentUser && !hasLoadedRef.current) {
      console.log('🚀 Initial load for user:', currentUser.uid);
      loadUserData();
    } else if (!currentUser) {
      // Reset quand logout
      console.log('🔄 User logged out, clearing data');
      setContacts([]);
      setCustomFields([]);
      setCustomTags({
        relationType: [],
        meetingPlace: [],
        discussionStatus: []
      });
      hasLoadedRef.current = false;
      
      // Unsubscribe listener
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }
  }, [currentUser, loadUserData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  // Marquer metadata comme modifié quand ils changent
  useEffect(() => {
    if (hasLoadedRef.current) {
      pendingChangesRef.current.metadata = true;
      debouncedSave();
    }
  }, [customTags, customFields, defaultFields, debouncedSave]);

  const value = {
    contacts,
    setContacts,
    addContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    defaultFields,
    setDefaultFields,
    customFields,
    setCustomFields,
    customTags,
    setCustomTags,
    getAllFields,
    loadUserData,
    saveContacts,
    forceSave,
    loading,
    darkMode,
    toggleDarkMode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
