import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const removeDuplicatesFromUnfollowers = async (userId) => {
  try {
    console.log('🔄 Starting duplicate removal...');

    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      console.log('❌ User document not found');
      return { success: false, error: 'User not found' };
    }

    const data = userDoc.data();
    
    // Remove duplicates from arrays
    const normalUnfollowers = data.normalUnfollowers 
      ? [...new Set(data.normalUnfollowers)] 
      : [];
    
    const doNotFollowList = data.doNotFollowList 
      ? [...new Set(data.doNotFollowList)] 
      : [];
    
    const unfollowers = data.unfollowersData?.unfollowers 
      ? [...new Set(data.unfollowersData.unfollowers)] 
      : [];
    
    // Remove from unfollowers list anyone who is in normalUnfollowers or doNotFollowList
    const cleanedUnfollowers = unfollowers.filter(u => 
      !normalUnfollowers.includes(u) && !doNotFollowList.includes(u)
    );

    // Save back to Firebase
    await setDoc(doc(db, 'users', userId), {
      normalUnfollowers,
      doNotFollowList,
      unfollowersData: {
        ...data.unfollowersData,
        unfollowers: cleanedUnfollowers
      }
    }, { merge: true });

    console.log('✅ Duplicates removed successfully');
    console.log(`📊 Stats:
      - Normal unfollowers: ${normalUnfollowers.length}
      - Do not follow: ${doNotFollowList.length}
      - Unfollowers: ${cleanedUnfollowers.length}
    `);

    return {
      success: true,
      stats: {
        normalUnfollowers: normalUnfollowers.length,
        doNotFollowList: doNotFollowList.length,
        unfollowers: cleanedUnfollowers.length
      }
    };

  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    return { success: false, error: error.message };
  }
};
