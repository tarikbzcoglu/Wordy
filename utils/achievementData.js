// Achievement definitions
export const ACHIEVEMENTS = {
    // Progress Achievements
    FIRST_STEP: {
        id: 'first_step',
        title: 'First Step',
        description: 'Complete your first level',
        icon: '🎯',
        category: 'progress',
        requirement: { type: 'levels_completed', count: 1 },
        reward: { coins: 50 },
    },
    JOURNEY_BEGINS: {
        id: 'journey_begins',
        title: 'Journey Begins',
        description: 'Complete 10 levels',
        icon: '🚀',
        category: 'progress',
        requirement: { type: 'levels_completed', count: 10 },
        reward: { coins: 100 },
    },
    EXPERIENCED_PLAYER: {
        id: 'experienced_player',
        title: 'Experienced Player',
        description: 'Complete 50 levels',
        icon: '⭐',
        category: 'progress',
        requirement: { type: 'levels_completed', count: 50 },
        reward: { coins: 250 },
    },
    MASTER_PLAYER: {
        id: 'master_player',
        title: 'Master Player',
        description: 'Complete 100 levels',
        icon: '👑',
        category: 'progress',
        requirement: { type: 'levels_completed', count: 100 },
        reward: { coins: 500 },
    },

    // Category Achievements
    CATEGORY_EXPERT: {
        id: 'category_expert',
        title: 'Category Expert',
        description: 'Complete 10 levels in one category',
        icon: '📚',
        category: 'category',
        requirement: { type: 'category_levels', count: 10 },
        reward: { coins: 150 },
    },
    VERSATILE: {
        id: 'versatile',
        title: 'Versatile',
        description: 'Play in 5 different categories',
        icon: '🎨',
        category: 'category',
        requirement: { type: 'categories_played', count: 5 },
        reward: { coins: 200 },
    },
    ALL_CATEGORIES: {
        id: 'all_categories',
        title: 'All Categories',
        description: 'Complete at least 1 level in every category',
        icon: '🌟',
        category: 'category',
        requirement: { type: 'all_categories', count: 9 },
        reward: { coins: 300 },
    },

    // Performance Achievements
    PERFECT: {
        id: 'perfect',
        title: 'Perfect',
        description: 'Complete 10 levels with 3 stars',
        icon: '💎',
        category: 'performance',
        requirement: { type: 'perfect_levels', count: 10 },
        reward: { coins: 200 },
    },
    FLAWLESS: {
        id: 'flawless',
        title: 'Flawless',
        description: 'Complete 5 levels without mistakes',
        icon: '✨',
        category: 'performance',
        requirement: { type: 'no_mistake_levels', count: 5 },
        reward: { coins: 150 },
    },
    NO_HINTS: {
        id: 'no_hints',
        title: 'No Hints',
        description: 'Complete 10 levels without using hints',
        icon: '🧠',
        category: 'performance',
        requirement: { type: 'no_hint_levels', count: 10 },
        reward: { coins: 200 },
    },
    SPEED_DEMON: {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Complete 5 levels in under 30 seconds',
        icon: '⚡',
        category: 'performance',
        requirement: { type: 'fast_levels', count: 5 },
        reward: { coins: 150 },
    },

    // Streak Achievements
    DETERMINED: {
        id: 'determined',
        title: 'Determined',
        description: '3-day streak',
        icon: '🔥',
        category: 'streak',
        requirement: { type: 'streak', count: 3 },
        reward: { coins: 100 },
    },
    ADDICTED: {
        id: 'addicted',
        title: 'Addicted',
        description: '7-day streak',
        icon: '🔥🔥',
        category: 'streak',
        requirement: { type: 'streak', count: 7 },
        reward: { coins: 250 },
    },
    LEGENDARY: {
        id: 'legendary',
        title: 'Legendary',
        description: '30-day streak',
        icon: '🔥🔥🔥',
        category: 'streak',
        requirement: { type: 'streak', count: 30 },
        reward: { coins: 1000 },
    },
};

// Achievement categories for grouping
export const ACHIEVEMENT_CATEGORIES = {
    progress: { name: 'Progress', icon: '🎯' },
    category: { name: 'Category', icon: '📚' },
    performance: { name: 'Performance', icon: '💎' },
    streak: { name: 'Streak', icon: '🔥' },
};

// Get all achievements as array
export const getAllAchievements = () => Object.values(ACHIEVEMENTS);

// Get achievements by category
export const getAchievementsByCategory = (category) => {
    return getAllAchievements().filter(a => a.category === category);
};
