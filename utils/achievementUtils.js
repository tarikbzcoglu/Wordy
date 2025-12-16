import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllAchievements } from './achievementData';

// AsyncStorage keys
// AsyncStorage keys
const ACHIEVEMENTS_KEY = 'unlocked_achievements';
const STATS_KEY = 'player_stats';

// Initialize player stats
export const initializePlayerStats = async () => {
    try {
        const existingStats = await AsyncStorage.getItem(STATS_KEY);
        if (!existingStats) {
            const initialStats = {
                total_levels_completed: 0,
                total_stars: 0,
                perfect_levels: 0, // 3 yıldız
                no_hint_levels: 0,
                no_mistake_levels: 0,
                fast_levels: 0, // <30 saniye
                categories_played: [],
                category_levels: {}, // { 'Planet Earth': 5, ... }
                current_streak: 0,
                longest_streak: 0,
                last_played_date: null,
            };
            await AsyncStorage.setItem(STATS_KEY, JSON.stringify(initialStats));
        }
    } catch (error) {
        console.error('Failed to initialize player stats:', error);
    }
};

// Get player stats
export const getPlayerStats = async () => {
    try {
        const statsJson = await AsyncStorage.getItem(STATS_KEY);
        let stats = statsJson ? JSON.parse(statsJson) : null;

        if (!stats) {
            // Return default stats if not found, but don't save yet (let update handle it)
            stats = {
                total_levels_completed: 0,
                total_stars: 0,
                perfect_levels: 0,
                no_hint_levels: 0,
                no_mistake_levels: 0,
                fast_levels: 0,
                categories_played: [],
                category_levels: {},
                current_streak: 1,
                longest_streak: 1,
                last_played_date: null,
            };
        }

        // Merge endless high score
        const endlessHigh = await AsyncStorage.getItem('high_score_endless');
        stats.high_score_endless = endlessHigh ? parseInt(endlessHigh, 10) : 0;

        return stats;
    } catch (error) {
        console.error('Failed to get player stats:', error);
        return null;
    }
};

// Update player stats
export const updatePlayerStats = async (updates) => {
    try {
        let currentStats = await getPlayerStats();
        // getPlayerStats now returns default object if null, so currentStats is guaranteed (mostly)

        const newStats = { ...currentStats };

        // Update levels completed
        if (updates.levels_completed) {
            newStats.total_levels_completed += updates.levels_completed;
        }

        // Update stars
        if (updates.stars) {
            newStats.total_stars += updates.stars;
        }

        // Update perfect levels (3 stars)
        if (updates.perfect) {
            newStats.perfect_levels += 1;
        }

        // Update no hints levels
        if (updates.no_hints) {
            newStats.no_hint_levels += 1;
        }

        // Update no mistakes levels
        if (updates.no_mistakes) {
            newStats.no_mistake_levels += 1;
        }

        // Update fast levels (<30 seconds)
        if (updates.fast) {
            newStats.fast_levels += 1;
        }

        // Update categories played
        if (updates.category && !newStats.categories_played.includes(updates.category)) {
            newStats.categories_played.push(updates.category);
        }

        // Update category levels
        if (updates.category) {
            if (!newStats.category_levels[updates.category]) {
                newStats.category_levels[updates.category] = 0;
            }
            newStats.category_levels[updates.category] += 1;
        }

        // Update streak
        const today = new Date().toDateString();
        const lastPlayed = newStats.last_played_date;

        if (lastPlayed) {
            const lastDate = new Date(lastPlayed);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day
                newStats.current_streak += 1;
            } else if (diffDays > 1) {
                // Streak broken
                newStats.current_streak = 1;
            }
            // Same day, don't change streak
        } else {
            // First time playing
            newStats.current_streak = 1;
        }

        newStats.longest_streak = Math.max(newStats.longest_streak, newStats.current_streak);
        newStats.last_played_date = today;

        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(newStats));
        return newStats;
    } catch (error) {
        console.error('Failed to update player stats:', error);
        return null;
    }
};

// Get unlocked achievements
export const getUnlockedAchievements = async () => {
    try {
        const unlocked = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
        return unlocked ? JSON.parse(unlocked) : [];
    } catch (error) {
        console.error('Failed to get unlocked achievements:', error);
        return [];
    }
};

// Unlock achievement
export const unlockAchievement = async (achievementId) => {
    try {
        const unlocked = await getUnlockedAchievements();
        if (!unlocked.includes(achievementId)) {
            unlocked.push(achievementId);
            await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));

            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to unlock achievement:', error);
        return false;
    }
};

// Check if achievement is unlocked
const isAchievementUnlocked = (achievement, stats) => {
    const { requirement } = achievement;

    switch (requirement.type) {
        case 'levels_completed':
            return stats.total_levels_completed >= requirement.count;

        case 'perfect_levels':
            return stats.perfect_levels >= requirement.count;

        case 'no_hint_levels':
            return stats.no_hint_levels >= requirement.count;

        case 'no_mistake_levels':
            return stats.no_mistake_levels >= requirement.count;

        case 'fast_levels':
            return stats.fast_levels >= requirement.count;

        case 'categories_played':
            return stats.categories_played.length >= requirement.count;

        case 'all_categories':
            return stats.categories_played.length >= requirement.count;

        case 'category_levels':
            // Check if any category has enough levels
            return Object.values(stats.category_levels).some(count => count >= requirement.count);

        case 'streak':
            return stats.current_streak >= requirement.count;

        case 'endless_high_score':
            return (stats.high_score_endless || 0) >= requirement.count;

        default:
            return false;
    }
};

// Check for new achievements
export const checkAchievements = async (temporaryStats = null) => {
    try {
        let stats = await getPlayerStats();
        if (!stats) return [];

        // Apply temporary stats overrides (e.g. current endless score from game loop)
        if (temporaryStats) {
            stats = { ...stats, ...temporaryStats };
        }

        const unlockedAchievements = await getUnlockedAchievements();
        const newAchievements = [];

        for (const achievement of getAllAchievements()) {
            if (!unlockedAchievements.includes(achievement.id)) {
                if (isAchievementUnlocked(achievement, stats)) {
                    const unlocked = await unlockAchievement(achievement.id);
                    if (unlocked) {
                        newAchievements.push(achievement);
                    }
                }
            }
        }

        return newAchievements;
    } catch (error) {
        console.error('Failed to check achievements:', error);
        return [];
    }
};

// Get achievement progress
export const getAchievementProgress = async (achievement) => {
    try {
        const stats = await getPlayerStats();
        if (!stats) return { current: 0, total: achievement.requirement.count };

        const { requirement } = achievement;
        let current = 0;

        switch (requirement.type) {
            case 'levels_completed':
                current = stats.total_levels_completed;
                break;
            case 'perfect_levels':
                current = stats.perfect_levels;
                break;
            case 'no_hint_levels':
                current = stats.no_hint_levels;
                break;
            case 'no_mistake_levels':
                current = stats.no_mistake_levels;
                break;
            case 'fast_levels':
                current = stats.fast_levels;
                break;
            case 'categories_played':
            case 'all_categories':
                current = stats.categories_played.length;
                break;
            case 'category_levels':
                current = Math.max(...Object.values(stats.category_levels), 0);
                break;
            case 'streak':
                current = stats.current_streak;
                break;
            case 'endless_high_score':
                current = stats.high_score_endless || 0;
                break;
        }

        return {
            current: Math.min(current, requirement.count),
            total: requirement.count,
            percentage: Math.min((current / requirement.count) * 100, 100),
        };
    } catch (error) {
        console.error('Failed to get achievement progress:', error);
        return { current: 0, total: achievement.requirement.count, percentage: 0 };
    }
};


