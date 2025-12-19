import { collection, doc, getDocs, limit, orderBy, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const COLLECTION_NAME = 'leaderboard';

/**
 * Submits a score to the category leaderboard.
 * @param {string} userId - Unique ID of the user (from AsyncStorage or Auth)
 * @param {string} username - Display name
 * @param {number} score - The score to submit (level number or endless score)
 * @param {string} category - Category name (e.g., 'Planet Earth', 'endless')
 */
export const submitScore = async (userId, username, score, category = 'endless') => {
    try {
        // Normalize category name for document ID (remove spaces and special chars)
        const categoryId = category.replace(/\s+/g, '_').replace(/&/g, 'and');
        const scoreRef = doc(db, COLLECTION_NAME, `${userId}_${categoryId}`);
        await setDoc(scoreRef, {
            userId,
            username,
            score,
            category,
            updatedAt: new Date(),
        });
        console.log(`Score submitted successfully for ${category}!`);
    } catch (e) {
        console.error('Error adding document: ', e);
    }
};

/**
 * Fetches the top scores from the leaderboard for a specific category.
 * @param {number} limitCount - Number of top scores to fetch (default: 50)
 * @param {string} category - Category name (e.g., 'Planet Earth', 'endless')
 * @returns {Promise<Array>} List of score objects
 */
export const getLeaderboard = async (limitCount = 50, category = 'endless') => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('category', '==', category),
            orderBy('score', 'desc'),
            limit(limitCount)
        );

        const querySnapshot = await getDocs(q);
        const scores = [];
        querySnapshot.forEach((doc) => {
            scores.push(doc.data());
        });
        return scores;
    } catch (e) {
        console.error('Error fetching leaderboard: ', e);
        return [];
    }
};
