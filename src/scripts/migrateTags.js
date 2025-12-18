import { db } from '../services/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

// Tags par défaut à utiliser comme base
const DEFAULT_TAGS = {
  relationType: [
    { value: 'Ami', label: '👥 Ami', color: '#4CAF50', class: 'tag-ami' },
    { value: 'Famille', label: '👨‍👩‍👧 Famille', color: '#FF9800', class: 'tag-famille' },
    { value: 'Connaissance', label: '🤝 Connaissance', color: '#2196F3', class: 'tag-connaissance' },
    { value: 'Sexe', label: '❤️ Sexe', color: '#E91E63', class: 'tag-sexe' }
  ],
  meetingPlace: [
    { value: 'IRL', label: '🌍 IRL', color: '#795548', class: 'tag-irl' },
    { value: 'Insta', label: '📸 Insta', color: '#E1306C', class: 'tag-insta' },
    { value: 'Tinder', label: '🔥 Tinder', color: '#FF6B6B', class: 'tag-tinder' },
    { value: 'Hinge', label: '💜 Hinge', color: '#9C27B0', class: 'tag-hinge' },
    { value: 'Soirée Tech', label: '🎵 Soirée Tech', color: '#00BCD4', class: 'tag-soiree-tech' }
  ],
  discussionStatus: [
    { value: 'Déjà parlé', label: '💬 Déjà parlé', color: '#4CAF50', class: 'tag-deja-parle' },
    { value: 'Jamais parlé', label: '🤐 Jamais parlé', color: '#F44336', class: 'tag-jamais-parle' },
    { value: 'En vu', label: '👀 En vu', color: '#FF9800', class: 'tag-en-vu' },
    { value: 'En cours', label: '📝 En cours', color: '#2196F3', class: 'tag-en-cours' }
  ]
};

export const migrateTags = async (userId) => {
  try {
    console.log('🔄 Starting tags migration...');

    // 1. Récupérer tous les contacts
    const contactsSnapshot = await getDocs(
      collection(db, 'users', userId, 'contacts')
    );
    const contacts = contactsSnapshot.docs.map(doc => doc.data());

    console.log(`📊 Found ${contacts.length} contacts`);

    // 2. Extraire toutes les valeurs uniques pour chaque champ
    const uniqueTags = {
      relationType: new Set(),
      meetingPlace: new Set(),
      discussionStatus: new Set()
    };

    contacts.forEach(contact => {
      if (contact.relationType) uniqueTags.relationType.add(contact.relationType);
      if (contact.meetingPlace) uniqueTags.meetingPlace.add(contact.meetingPlace);
      if (contact.discussionStatus) uniqueTags.discussionStatus.add(contact.discussionStatus);
    });

    console.log('📋 Unique values found:');
    console.log('  - relationType:', Array.from(uniqueTags.relationType));
    console.log('  - meetingPlace:', Array.from(uniqueTags.meetingPlace));
    console.log('  - discussionStatus:', Array.from(uniqueTags.discussionStatus));

    // 3. Créer les tags dans customTags
    const customTags = {
      relationType: [],
      meetingPlace: [],
      discussionStatus: []
    };

    // Pour chaque champ, créer les tags
    Object.keys(uniqueTags).forEach(fieldId => {
      const values = Array.from(uniqueTags[fieldId]);
      
      values.forEach(value => {
        // Chercher si un tag par défaut existe pour cette valeur
        const defaultTag = DEFAULT_TAGS[fieldId]?.find(t => t.value === value);
        
        if (defaultTag) {
          // Utiliser le tag par défaut (avec emoji et couleur)
          customTags[fieldId].push(defaultTag);
        } else {
          // Créer un nouveau tag basique
          customTags[fieldId].push({
            value: value,
            label: value,
            color: '#E1306C',
            class: `tag-${value.toLowerCase().replace(/\s+/g, '-')}`
          });
        }
      });
    });

    console.log('✨ Created tags:', customTags);

    // 4. Sauvegarder dans Firebase
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      customTags: customTags
    }, { merge: true });

    console.log('✅ Migration complete! Tags saved to Firebase.');
    console.log('📊 Summary:');
    console.log(`  - relationType: ${customTags.relationType.length} tags`);
    console.log(`  - meetingPlace: ${customTags.meetingPlace.length} tags`);
    console.log(`  - discussionStatus: ${customTags.discussionStatus.length} tags`);

    return {
      success: true,
      tags: customTags
    };

  } catch (error) {
    console.error('❌ Migration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
