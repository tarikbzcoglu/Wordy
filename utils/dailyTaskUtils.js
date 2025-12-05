import AsyncStorage from '@react-native-async-storage/async-storage';
import { addCoins } from './achievementUtils';

const DAILY_TASKS_KEY = 'daily_tasks_v1';

// Görev Tipleri
export const TASK_TYPES = {
    LEVELS: 'LEVELS',          // X seviye tamamla
    STARS: 'STARS',            // X yıldız topla
    NO_MISTAKE: 'NO_MISTAKE',  // Hatasız X seviye tamamla
    NO_HINT: 'NO_HINT',        // İpucu kullanmadan X seviye tamamla
    FAST: 'FAST',              // 30 sn altında X seviye tamamla
};

// Görev Tanımları (Templates)
const TASK_TEMPLATES = [
    { type: TASK_TYPES.LEVELS, target: 3, reward: 50, description: 'Complete 3 levels' },
    { type: TASK_TYPES.LEVELS, target: 5, reward: 75, description: 'Complete 5 levels' },
    { type: TASK_TYPES.STARS, target: 5, reward: 50, description: 'Collect 5 stars' },
    { type: TASK_TYPES.STARS, target: 10, reward: 100, description: 'Collect 10 stars' },
    { type: TASK_TYPES.NO_MISTAKE, target: 1, reward: 50, description: 'Complete 1 level without mistakes' },
    { type: TASK_TYPES.NO_MISTAKE, target: 3, reward: 150, description: 'Complete 3 levels without mistakes' },
    { type: TASK_TYPES.NO_HINT, target: 2, reward: 50, description: 'Complete 2 levels without hints' },
    { type: TASK_TYPES.NO_HINT, target: 5, reward: 100, description: 'Complete 5 levels without hints' },
    { type: TASK_TYPES.FAST, target: 2, reward: 50, description: 'Complete 2 levels under 30s' },
];

// Helper: Rastgele görev seç
const getRandomTasks = (count = 3) => {
    const shuffled = [...TASK_TEMPLATES].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((task, index) => ({
        ...task,
        id: `daily_${Date.now()}_${index}`,
        current: 0,
        completed: false,
        claimed: false,
    }));
};

// Günlük Görevleri Getir (veya oluştur)
export const getDailyTasks = async () => {
    try {
        const storedData = await AsyncStorage.getItem(DAILY_TASKS_KEY);
        const today = new Date().toDateString();

        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData.date === today) {
                return parsedData;
            }
        }

        // Yeni gün, yeni görevler
        const newTasks = {
            date: today,
            tasks: getRandomTasks(3),
            allCompleted: false,
            bonusClaimed: false,
        };
        await AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(newTasks));
        return newTasks;
    } catch (error) {
        console.error('Failed to get daily tasks:', error);
        return null;
    }
};

// İlerleme Güncelle
export const updateDailyProgress = async (type, amount = 1) => {
    try {
        const dailyData = await getDailyTasks();
        if (!dailyData) return null;

        let updated = false;
        const newTasks = dailyData.tasks.map(task => {
            if (!task.completed && task.type === type) {
                task.current += amount;
                if (task.current >= task.target) {
                    task.current = task.target;
                    task.completed = true;
                }
                updated = true;
            }
            return task;
        });

        if (updated) {
            dailyData.tasks = newTasks;

            // Hepsi tamamlandı mı kontrol et
            const allDone = newTasks.every(t => t.completed);
            if (allDone && !dailyData.allCompleted) {
                dailyData.allCompleted = true;
            }

            await AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(dailyData));
        }

        return dailyData;
    } catch (error) {
        console.error('Failed to update daily progress:', error);
        return null;
    }
};

// Ödül Al (Tekil Görev)
export const claimTaskReward = async (taskId) => {
    try {
        const dailyData = await getDailyTasks();
        if (!dailyData) return false;

        const task = dailyData.tasks.find(t => t.id === taskId);
        if (task && task.completed && !task.claimed) {
            task.claimed = true;
            await addCoins(task.reward);
            await AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(dailyData));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to claim task reward:', error);
        return false;
    }
};

// Bonus Ödül Al (Tümü Tamamlandığında)
export const claimBonusReward = async () => {
    try {
        const dailyData = await getDailyTasks();
        if (!dailyData) return false;

        if (dailyData.allCompleted && !dailyData.bonusClaimed) {
            dailyData.bonusClaimed = true;
            await addCoins(200); // Sabit 200 coin bonus
            await AsyncStorage.setItem(DAILY_TASKS_KEY, JSON.stringify(dailyData));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Failed to claim bonus reward:', error);
        return false;
    }
};
