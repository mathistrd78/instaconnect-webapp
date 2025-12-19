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

    // Move misplaced fields from custom to default
    const misplacedInCustom = customFields.filter(f => DEFAULT_FIELD_IDS.includes(f.id));
    const correctCustomFields = customFields.filter(f => !DEFAULT_FIELD_IDS.includes(f.id));

    // Add misplaced fields back to default if they're not already there
    misplacedInCustom.forEach(field => {
      if (!defaultFields.find(f => f.id === field.id)) {
        defaultFields.push(field);
        console.log(`✅ Moved ${field.id} back to defaultFields`);
      }
    });

    // Sort by order
    defaultFields.sort((a, b) => (a.order || 0) - (b.order || 0));
    correctCustomFields.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Save corrected structure
    await setDoc(doc(db, 'users', userId), {
      defaultFields,
      customFields: correctCustomFields
    }, { merge: true });

    console.log('✅ Fields structure fixed');
    console.log('Default fields:', defaultFields.length);
    console.log('Custom fields:', correctCustomFields.length);

    return {
      success: true,
      movedCount: misplacedInCustom.length
    };

  } catch (error) {
    console.error('❌ Error fixing fields:', error);
    return { success: false, error: error.message };
  }
};
