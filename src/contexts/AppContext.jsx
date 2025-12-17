import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  getDoc
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
    order: -2
  },
  {
    id: 'instagram',
    type: 'text',
    label: 'Instagram',
    required: false,
    order: -1
  },
  {
    id: 'relationType',
    type: 'select',
    label: 'Type de relation',
    required: true,
    order: 0,
    tags: []
  },
  {
    id: 'meetingPlace',
    type: 'select',
    label: 'Lieu de rencontre',
    required: true,
    order: 1,
    tags: []
  },
  {
    id: 'discussionStatus',
    type: 'select',
    label: 'Statut de discussion',
    required: true,
    order: 2,
    tags: []
  },
  {
    id: 'gender',
    type: 'radio',
    label: 'Sexe',
    required: true,
    order: 3,
    options: ['👨 Homme', '👩 Femme']
  },
  {
    id: 'location',
    type: 'text',
    label: 'Localisation',
    required: false,
    order: 4
  },
  {
    id: 'birthDate',
    type: 'date',
    label: 'Anniversaire',
    required: false,
    order: 5
  },
  {
    id: 'nextMeeting',
    type: 'date',
    label: 'Prochain RDV',
    required: false,
    order: 6
  },
  {
    id: 'notes',
    type: 'textarea',
    label: 'Notes personnelles',
    required: false,
    order: 7
  }
];

const DEFAULT_TAGS = {
  relationType: [
    { value: 'Ami', label: '👥 Ami', class: 'tag-ami' },
    { value: 'Famille', label: '👨‍👩‍👧 Famille', class: 'tag-famille' },
    { value: 'Connaissance', label: '🤝 Connaissance', class: 'tag-connaissance' },
    { value: 'Sexe', label: '❤️ Sexe', class: 'tag-sexe' }
  ],
  meetingPlace: [
    { value: 'IRL', label: '🌍 IRL', class: 'tag-irl' },
    { value: 'Insta', label: '📸 Insta', class: 'tag-insta' },
    { value: 'Tinder', label: '🔥 Tinder', class: 'tag-tinder' },
    { value: 'Hinge', label: '💜 Hinge', class: 'tag-hinge' },
    { value: 'Soirée Tech', label: '🎵 Soirée Tech', class: 'tag-soiree-tech' }
  ],
  discussionStatus: [
    { value: 'Déjà parlé', label: '💬 Déjà parlé', class: 'tag-deja-parle' },
    { value: 'Jamais parlé', label: '🤐 Jamais parlé', class: 'tag-jamais-parle' },
    { value: 'En vu', label: '👀 En vu', class: 'tag-en-vu' },
    { value: 'En cours', label: '📝 En cours', class: 'tag-en-cours' }
  ]
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

  // Initialize default tags in fields
  useEffect(() => {
    const updatedFields = defaultFields.map(field => {
      if (field.type === 'select' && DEFAULT_TAGS[field.id]) {
        return {
          ...field,
          tags: [...DEFAULT_TAGS[field.id], ...(customTags[field.id] || [])]
        };
      }
      return field;
    });
    setDefaultFields(updatedFields);
  }, [customTags]);

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
        if (userData.defaultFields) {
          setDefaultFields(userData.defaultFields);
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
  const saveContacts = async (contactsToSave = null, saveMetadata = false) => {
    if (!currentUser) return;

    try {
      const userId = currentUser.uid;
      const batch = writeBatch(db);

      if (contactsToSave) {
        // Save specific contacts
        const contactsArray = Array.isArray(contactsToSave) ? contactsToSave : [contactsToSave];
        contactsArray.forEach(contact => {
          const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
          batch.set(contactRef, contact);
        });
      } else if (contacts.length > 0) {
        // Save all contacts
        contacts.forEach(contact => {
          const contactRef = doc(db, 'users', userId, 'contacts', contact.id);
          batch.set(contactRef, contact);
        });
      }

      // Save metadata if requested
      if (saveMetadata) {
        const userRef = doc(db, 'users', userId);
        batch.set(userRef, {
          customTags,
          customFields,
          defaultFields
        }, { merge: true });
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
      await setDoc(contactRef, { deleted: true }, { merge: true });
    }
  };

  // Get all fields (default + custom)
  const getAllFields = () => {
    return [...defaultFields, ...customFields].sort((a, b) => a.order - b.order);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  // Apply dark mode on mount
  useEffect(() => {
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
    defaultFields,
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
