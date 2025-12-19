import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const fixFieldsStructure = async (userId) => {
  try {
    console.log('🔧 Fixing fields structure...');

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    let defaultFields = userData.defaultFields || [];
    let customFields = userData.customFields || [];

    const DEFAULT_FIELD_IDS = [
      'instagram',
      'firstName',
      'gender',
      'birthDate',
      'location',
      'relationType',
      'meetingPlace',
      'discussionStatus',
      'nextMeeting',
      'notes'
    ];

    let movedCount = 0;

    // FIX 1: Remove birthday and meetingDate from customFields (wrong IDs)
    const fieldsToRemove = ['birthday', 'meetingDate'];
    const cleanedCustomFields = customFields.filter(f => !fieldsToRemove.includes(f.id));
    
    if (customFields.length !== cleanedCustomFields.length) {
      console.log('✅ Removed birthday and meetingDate from customFields');
      movedCount += customFields.length - cleanedCustomFields.length;
    }

    // FIX 2: Ensure birthDate and nextMeeting exist in defaultFields with correct structure
    const birthDateExists = defaultFields.find(f => f.id === 'birthDate');
    if (!birthDateExists) {
      defaultFields.push({
        id: 'birthDate',
        type: 'date',
        label: 'Anniversaire',
        required: false,
        order: 8
      });
      console.log('✅ Added birthDate to defaultFields');
      movedCount++;
    }

    const nextMeetingExists = defaultFields.find(f => f.id === 'nextMeeting');
    if (!nextMeetingExists) {
      defaultFields.push({
        id: 'nextMeeting',
        type: 'date',
        label: 'Prochain RDV',
        required: false,
        order: 9
      });
      console.log('✅ Added nextMeeting to defaultFields');
      movedCount++;
    }

    // Sort by order
    defaultFields.sort((a, b) => (a.order || 0) - (b.order || 0));
    cleanedCustomFields.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Save corrected structure
    await setDoc(doc(db, 'users', userId), {
      defaultFields,
      customFields: cleanedCustomFields
    }, { merge: true });

    console.log('✅ Fields structure fixed');
    console.log('Default fields:', defaultFields.map(f => f.id));
    console.log('Custom fields:', cleanedCustomFields.map(f => f.id));

    return {
      success: true,
      movedCount
    };

  } catch (error) {
    console.error('❌ Error fixing fields:', error);
    return { success: false, error: error.message };
  }
};
