/**
 * Level System Utilities
 * Helper functions for dynamic difficulty and level progression
 */

/**
 * Get the number of questions for a given level
 * Gradually increases difficulty as player progresses
 */
export const getQuestionCount = (level) => {
    return 5; // Fixed at 5 questions per level as requested
};

/**
 * Determine the type of level
 * @returns 'boss' | 'challenge' | 'standard'
 */
export const getLevelType = (level) => {
    if (level % 10 === 0) return 'boss';      // Every 10th level
    if (level % 5 === 0) return 'challenge';  // Every 5th level
    return 'standard';
};

/**
 * Calculate star rating based on performance
 * @param {Object} stats - Performance statistics
 * @param {number} stats.hintsUsed - Number of hints used
 * @param {number} stats.mistakes - Number of wrong answers
 * @returns {number} Star rating (1-3)
 */
export const calculateStarRating = (stats) => {
    const { hintsUsed = 0, mistakes = 0 } = stats;

    // Perfect: No hints, no mistakes
    if (hintsUsed === 0 && mistakes === 0) return 3;

    // Good: 1-2 hints or mistakes
    if (hintsUsed + mistakes <= 2) return 2;

    // Complete: 3+ hints or mistakes
    return 1;
};

/**
 * Get milestone reward information
 * @param {number} level - Current level
 * @returns {Object|null} Reward info or null if not a milestone
 */
export const getMilestoneReward = (level) => {
    const milestones = {
        5: { type: 'evolution', message: '🎉 Companion Evolution!' },
        10: { type: 'skin', message: '🎨 New Companion Skin!' },
        15: { type: 'evolution', message: '✨ Major Evolution!' },
        20: { type: 'achievement', message: '🏆 Master Badge Unlocked!' },
        25: { type: 'premium', message: '💎 Premium Skin Unlocked!' },
        30: { type: 'master', message: '👑 Expert Status!' },
    };

    return milestones[level] || null;
};

/**
 * Check if a level is a milestone
 */
export const isMilestone = (level) => {
    return level % 5 === 0;
};

/**
 * Get difficulty label for UI
 */
export const getDifficultyLabel = (level) => {
    if (level <= 5) return 'Easy';
    if (level <= 10) return 'Medium';
    if (level <= 15) return 'Hard';
    if (level <= 20) return 'Expert';
    return 'Master';
};


