import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

export const migrateGenderField = async (userId) => {
  try {
    console.log('🔄 Migrating gender field...');

    // Mapping of old values to new indices
    // Based on options: ['Homme', 'Femme', 'Autre']
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
    const conversionLog = {};
    
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
          
          // Log conversions
          if (!conversionLog[currentValue]) {
            conversionLog[currentValue] = 0;
          }
          conversionLog[currentValue]++;
          
          console.log(`✅ Converting gender: "${currentValue}" → ${newIndex} (contact: ${contactDoc.id})`);
        } else {
          console.warn(`⚠️ Unknown gender value: "${currentValue}" (contact: ${contactDoc.id})`);
        }
      } else if (contactData.gender && typeof contactData.gender === 'number') {
        console.log(`ℹ️ Contact ${contactDoc.id} already has numeric gender: ${contactData.gender}`);
      }
    });
    
    // Execute all updates
    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      console.log(`✅ Migration completed: ${updatedCount} contacts updated`);
      console.log('📊 Conversion summary:', conversionLog);
    } else {
      console.log('ℹ️ No contacts to update (all already migrated or no gender values)');
    }
    
    return {
      success: true,
      updatedCount,
      conversionLog
    };
    
  } catch (error) {
    console.error('❌ Error migrating gender field:', error);
    return { success: false, error: error.message };
  }
};
