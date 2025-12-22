import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  getDoc,
  deleteDoc
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

  // Load user data from Firestore
  const loadUserData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const userId = currentUser.uid;
      console.log('📥 Loading user data from Firestore...');

      // Load metadata
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.customTags) {
          setCustomTags(userData.customTags);
        }
        
        if (userData.customFields) {
          setCustomFields(userData.customFields);
        }
        
        // Load default fields with saved order and merge with tags
        if (userData.defaultFields) {
          console.log('📥 Loading saved default fields with order:', userData.defaultFields);
          // Merge tags from customTags into defaultFields
          const fieldsWithTags = userData.defaultFields.map(field => {
            if (field.type === 'select' && userData.customTags && userData.customTags[field.id]) {
              return {
                ...field,
                tags: userData.customTags[field.id]
              };
            }
            return field;
          });
          setDefaultFields(fieldsWithTags);
        } else if (userData.customTags) {
          // If no saved defaultFields but we have customTags, merge them
          const fieldsWithTags = DEFAULT_FIELDS.map(field => {
            if (field.type === 'select' && userData.customTags[field.id]) {
              return {
                ...field,
                tags: userData.customTags[field.id]
              };
            }
            return field;
          });
          setDefaultFields(fieldsWithTags);
        }
      }

      // Load contacts
      const contactsSnapshot = await getDocs(
        collection(db, 'users', userId, 'contacts')
      );
      const contactsData = contactsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setContacts(contactsData);
      console.log(`✅ Loaded ${contactsData.length} contacts`);
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save contacts to Firestore
  const saveContacts = async (contactsToSave = null, saveMetadata = false, explicitMetadata = null) => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      const batch = writeBatch(db);

      if (contactsToSave) {
        const contactsArray = Array.isArray(contactsToSave) ? contactsToSave : [contactsToSave];
        contactsArray.forEach(contact => {
          const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
          batch.set(contactRef, contact);
        });
      } else if (contacts.length > 0) {
        contacts.forEach(contact => {
          const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
          batch.set(contactRef, contact);
        });
      }

      if (saveMetadata) {
        const userRef = doc(db, 'users', userId);
        const metadataToSave = explicitMetadata || {
          customTags,
          customFields,
          defaultFields
        };
        batch.set(userRef, metadataToSave, { merge: true });
        console.log('💾 Saving metadata to Firebase:', metadataToSave);
      }

      await batch.commit();
      console.log('✅ Data saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
    }
  };

  // Add contact
  const addContact = async (contact) => {
    const newContact = {
      ...contact,
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    await saveContacts(newContact);
    return newContact;
  };

  // Update contact
  const updateContact = async (contactId, updates) => {
    const updatedContacts = contacts.map(c =>
      c.id === contactId ? { ...c, ...updates } : c
    );
    setContacts(updatedContacts);
    
    const updatedContact = updatedContacts.find(c => c.id === contactId);
    if (updatedContact) {
      await saveContacts(updatedContact);
    }
  };

  // Delete contact
  const deleteContact = async (contactId) => {
    const updatedContacts = contacts.filter(c => c.id !== contactId);
    setContacts(updatedContacts);
    
    if (currentUser) {
      const contactRef = doc(db, 'users', currentUser.uid, 'contacts', contactId);
      await deleteDoc(contactRef);
    }
  };

  // Delete multiple contacts (for batch operations)
  const deleteMultipleContacts = async (contactIds) => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      const batch = writeBatch(db);

      contactIds.forEach(contactId => {
        const contactRef = doc(db, 'users', userId, 'contacts', contactId);
        batch.delete(contactRef);
      });

      await batch.commit();

      // Update local state
      const updatedContacts = contacts.filter(c => !contactIds.includes(c.id));
      setContacts(updatedContacts);

      console.log(`✅ Deleted ${contactIds.length} contacts`);
    } catch (error) {
      console.error('❌ Error deleting multiple contacts:', error);
      throw error;
    }
  };

  // Get all fields (default + custom)
  const getAllFields = () => {
    return [...defaultFields, ...customFields].sort((a, b) => a.order - b.order);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    console.log('toggleDarkMode called, current:', darkMode);
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    console.log('New mode:', newMode);
  };

  // Apply dark mode on mount and when darkMode changes
  useEffect(() => {
    console.log('Applying dark mode:', darkMode);
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Load data when user logs in
  useEffect(() => {
    if (currentUser) {
      loadUserData();
    } else {
      setContacts([]);
      setCustomFields([]);
      setCustomTags({
        relationType: [],
        meetingPlace: [],
        discussionStatus: []
      });
    }
  }, [currentUser]);

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
    saveContacts,
    loadUserData,
    loading,
    darkMode,
    toggleDarkMode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
