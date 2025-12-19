import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export const migrateToIndexValues = async (userId) => {
  try {
    console.log('🔄 Migrating to index-based values...');

    // Get user fields structure
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const userData = userDoc.data();
    const allFields = [...(userData.defaultFields || []), ...(userData.customFields || [])];
    
    // Get all contacts
    const contactsRef = collection(db, 'users', userId, 'contacts');
    const contactsSnapshot = await getDocs(contactsRef);
    
    let updatedCount = 0;
    let fieldUpdates = {};
    const updatePromises = [];
    
    contactsSnapshot.forEach((contactDoc) => {
      const contactData = contactDoc.data();
      const updates = {};
      let needsUpdate = false;
      
      // Check each field
      allFields.forEach(field => {
        if ((field.type === 'select' || field.type === 'radio') && contactData[field.id] !== undefined && contactData[field.id] !== '') {
          const currentValue = contactData[field.id];
          
          // If value is a string, convert to index
          if (typeof currentValue === 'string') {
            let index = -1;
            
            if (field.type === 'select' && field.tags) {
              index = field.tags.findIndex(tag => 
                (tag.value || tag) === currentValue || 
                (tag.label || tag) === currentValue
              );
            } else if (field.type === 'radio' && field.options) {
              index = field.options.findIndex(opt => opt === currentValue);
            }
            
            if (index >= 0) {
              updates[field.id] = index;
              needsUpdate = true;
              
              // Track field updates
              if (!fieldUpdates[field.id]) {
                fieldUpdates[field.id] = 0;
              }
              fieldUpdates[field.id]++;
              
              console.log(`Converting ${field.label} (${field.id}): "${currentValue}" → ${index}`);
            } else {
              console.warn(`⚠️ Could not find index for ${field.id}: "${currentValue}"`);
            }
          }
        }
      });
      
      if (needsUpdate) {
        updatePromises.push(
          setDoc(doc(db, 'users', userId, 'contacts', contactDoc.id), updates, { merge: true })
        );
        updatedCount++;
      }
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    console.log(`✅ Migrated ${updatedCount} contacts`);
    console.log('📊 Field updates:', fieldUpdates);
    
    return {
      success: true,
      updatedCount,
      fieldUpdates
    };
    
  } catch (error) {
    console.error('❌ Error migrating to index values:', error);
    return { success: false, error: error.message };
  }
};
