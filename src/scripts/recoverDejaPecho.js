import { db } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export const recoverDejaPecho = async (userId) => {
  try {
    console.log('🔄 Recovering "Déjà Pécho?" field...');

    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }

    const data = userDoc.data();
    const customFields = data.customFields || [];

    // Step 1: Find the old field ID in contacts
    const contactsRef = collection(db, 'users', userId, 'contacts');
    const contactsSnapshot = await getDocs(contactsRef);
    
    let oldFieldId = null;
    
    // Search for custom_ field in first contact
    contactsSnapshot.forEach((doc) => {
      const contactData = doc.data();
      const customKeys = Object.keys(contactData).filter(key => key.startsWith('custom_'));
      
      if (customKeys.length > 0 && !oldFieldId) {
        // Check if this custom field could be "Déjà Pécho?"
        const value = contactData[customKeys[0]];
        if (value === '❌ Non' || value === '✅ Oui' || value === 'Non' || value === 'Oui') {
          oldFieldId = customKeys[0];
        }
      }
    });

    if (!oldFieldId) {
      console.log('⚠️ Old field not found in contacts');
    } else {
      console.log('✅ Found old field ID:', oldFieldId);
    }

    // Step 2: Check if "Déjà Pécho?" already exists
    const exists = customFields.find(f => f.id === 'dejaPecho' || f.label === 'Déjà Pécho?');
    
    if (exists) {
      console.log('✅ Field structure already exists');
      
      // But we still need to migrate data if oldFieldId was found
      if (oldFieldId && oldFieldId !== 'dejaPecho') {
        await migrateFieldData(userId, oldFieldId, 'dejaPecho');
      }
      
      return { success: true, message: 'Field already exists', migrated: oldFieldId ? true : false };
    }

    // Step 3: Find highest order number
    const allFields = [...(data.defaultFields || []), ...customFields];
    const maxOrder = Math.max(...allFields.map(f => f.order || 0), 0);

    // Step 4: Create the field structure
    const dejaPechoField = {
      id: 'dejaPecho',
      type: 'radio',
      label: 'Déjà Pécho?',
      required: false,
      order: maxOrder + 1,
      options: ['✅ Oui', '❌ Non']
    };

    const updatedCustomFields = [...customFields, dejaPechoField];

    // Step 5: Save field structure to Firebase
    await setDoc(doc(db, 'users', userId), {
      customFields: updatedCustomFields
    }, { merge: true });

    console.log('✅ Field structure created');

    // Step 6: Migrate data if old field was found
    if (oldFieldId) {
      await migrateFieldData(userId, oldFieldId, 'dejaPecho');
    }

    return {
      success: true,
      field: dejaPechoField,
      migratedFrom: oldFieldId,
      contactsUpdated: oldFieldId ? true : false
    };

  } catch (error) {
    console.error('❌ Error recovering field:', error);
    return { success: false, error: error.message };
  }
};

// Helper function to migrate data from old field ID to new field ID
const migrateFieldData = async (userId, oldFieldId, newFieldId) => {
  try {
    console.log(`🔄 Migrating data from ${oldFieldId} to ${newFieldId}...`);
    
    const contactsRef = collection(db, 'users', userId, 'contacts');
    const contactsSnapshot = await getDocs(contactsRef);
    
    let updatedCount = 0;
    
    const updatePromises = [];
    
    contactsSnapshot.forEach((contactDoc) => {
      const contactData = contactDoc.data();
      
      if (contactData[oldFieldId]) {
        // Keep the value as is (with emojis)
        const value = contactData[oldFieldId];
        
        // Create update object
        const updateData = {
          [newFieldId]: value
        };
        
        // Remove old field
        updateData[oldFieldId] = null;
        
        // Add to batch
        updatePromises.push(
          setDoc(doc(db, 'users', userId, 'contacts', contactDoc.id), updateData, { merge: true })
        );
        
        updatedCount++;
      }
    });
    
    // Execute all updates
    await Promise.all(updatePromises);
    
    console.log(`✅ Migrated ${updatedCount} contacts`);
    
    return updatedCount;
    
  } catch (error) {
    console.error('❌ Error migrating data:', error);
    throw error;
  }
};
