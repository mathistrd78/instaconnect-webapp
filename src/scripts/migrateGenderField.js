import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export const migrateGenderField = async (userId) => {
  try {
    console.log('🔄 Migrating gender field...');

    // Get user fields structure
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const allFields = [...(userData.defaultFields || []), ...(userData.customFields || [])];
    
    // Find gender field
    const genderField = allFields.find(f => f.id === 'gender');
    
    if (!genderField || !genderField.tags) {
      return { success: false, error: 'Gender field not found' };
    }

    console.log('Gender field tags:', genderField.tags);

    // Mapping of old values to new indices
    const valueMap = {
      '👨 Homme': 0,
      'Homme': 0,
      '👩 Femme': 1,
      'Femme': 1,
      '🌈 Autre': 2,
      'Autre': 2
    };

    // Get all contacts
    const contactsRef = collection(db, 'users', userId, 'contacts');
    const contactsSnapshot = await getDocs(contactsRef);
    
    let updatedCount = 0;
    const updatePromises = [];
    
    contactsSnapshot.forEach((contactDoc) => {
      const contactData = contactDoc.data();
      
      if (contactData.gender && typeof contactData.gender === 'string') {
        const currentValue = contactData.gender;
        const newIndex = valueMap[currentValue];
        
        if (newIndex !== undefined) {
          updatePromises.push(
            setDoc(doc(db, 'users', userId, 'contacts', contactDoc.id), {
              gender: newIndex
            }, { merge: true })
          );
          updatedCount++;
          console.log(`Converting gender: "${currentValue}" → ${newIndex}`);
        } else {
          console.warn(`⚠️ Unknown gender value: "${currentValue}"`);
        }
      }
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    console.log(`✅ Migrated ${updatedCount} contacts`);
    
    return {
      success: true,
      updatedCount
    };
    
  } catch (error) {
    console.error('❌ Error migrating gender field:', error);
    return { success: false, error: error.message };
  }
};
