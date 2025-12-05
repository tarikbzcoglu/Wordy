import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ACHIEVEMENT_CATEGORIES, getAllAchievements } from '../utils/achievementData';
import { getAchievementProgress, getUnlockedAchievements } from '../utils/achievementUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const AchievementsModal = ({ isVisible, onClose }) => {
    const [unlockedAchievements, setUnlockedAchievements] = useState([]);
    const [achievementProgress, setAchievementProgress] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        if (isVisible) {
            loadAchievements();
        }
    }, [isVisible]);

    const loadAchievements = async () => {
        const unlocked = await getUnlockedAchievements();
        setUnlockedAchievements(unlocked);

        // Load progress for all achievements
        const allAchievements = getAllAchievements();
        const progress = {};
        for (const achievement of allAchievements) {
            progress[achievement.id] = await getAchievementProgress(achievement);
        }
        setAchievementProgress(progress);
    };

    const renderAchievement = (achievement) => {
        const isUnlocked = unlockedAchievements.includes(achievement.id);
        const progress = achievementProgress[achievement.id] || { current: 0, total: 1, percentage: 0 };

        return (
            <View key={achievement.id} style={styles.achievementCard}>
                <LinearGradient
                    colors={isUnlocked ? ['#4A7E8E', '#2C5F6F'] : ['#3A3A3A', '#2A2A2A']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.achievementGradient}
                >
                    {/* Icon */}
                    <View style={[styles.iconContainer, !isUnlocked && styles.lockedIcon]}>
                        <Text style={styles.achievementIcon}>
                            {isUnlocked ? achievement.icon : '🔒'}
                        </Text>
                    </View>

                    {/* Info */}
                    <View style={styles.achievementInfo}>
                        <Text style={[styles.achievementTitle, !isUnlocked && styles.lockedText]}>
                            {achievement.title}
                        </Text>
                        <Text style={[styles.achievementDescription, !isUnlocked && styles.lockedText]}>
                            {achievement.description}
                        </Text>

                        {/* Progress Bar */}
                        {!isUnlocked && (
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBg}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${progress.percentage}% ` },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.progressText}>
                                    {progress.current}/{progress.total}
                                </Text>
                            </View>
                        )}

                        {/* Reward */}
                        {isUnlocked && achievement.reward && achievement.reward.coins && (
                            <Text style={styles.reward}>
                                +{achievement.reward.coins} 💰
                            </Text>
                        )}
                    </View>
                </LinearGradient>
            </View>
        );
    };

    const getFilteredAchievements = () => {
        const all = getAllAchievements();
        if (selectedCategory === 'all') {
            return all;
        }
        return all.filter(a => a.category === selectedCategory);
    };

    const getCategoryStats = (category) => {
        const achievements = getAllAchievements().filter(a => a.category === category);
        const unlocked = achievements.filter(a => unlockedAchievements.includes(a.id)).length;
        return `${unlocked}/${achievements.length}`;
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LottieView
                                source={require('../assets/images/Achievements.json')}
                                autoPlay
                                loop
                                style={{ width: 40, height: 40, marginRight: 10 }}
                            />
                            <Text style={styles.headerTitle}>Achievements</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    {/* Category Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryTabs}
                    >
                        <Pressable
                            style={[styles.categoryTab, selectedCategory === 'all' && styles.categoryTabActive]}
                            onPress={() => setSelectedCategory('all')}
                        >
                            <Text style={[styles.categoryTabText, selectedCategory === 'all' && styles.categoryTabTextActive]}>
                                All
                            </Text>
                        </Pressable>
                        {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, cat]) => (
                            <Pressable
                                key={key}
                                style={[styles.categoryTab, selectedCategory === key && styles.categoryTabActive]}
                                onPress={() => setSelectedCategory(key)}
                            >
                                <Text style={[styles.categoryTabText, selectedCategory === key && styles.categoryTabTextActive]}>
                                    {cat.icon} {cat.name} {getCategoryStats(key)}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Achievements List */}
                    <ScrollView style={styles.achievementsList}>
                        {getFilteredAchievements().map(renderAchievement)}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 500,
        height: SCREEN_HEIGHT * 0.8,
        backgroundColor: '#1C3B4F',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#68919E',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#68919E',
    },
    headerTitle: {
        fontSize: 28,
        color: '#FFD700',
        fontFamily: 'Papyrus',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: '#E1E2E1',
    },
    categoryTabs: {
        maxHeight: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#68919E',
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 4,
    },
    categoryTabActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#FFD700',
    },
    categoryTabText: {
        fontSize: 14,
        color: '#B0BEC5',
        fontFamily: 'Papyrus',
    },
    categoryTabTextActive: {
        color: '#FFD700',
    },
    achievementsList: {
        flex: 1,
        padding: 16,
    },
    achievementCard: {
        marginBottom: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    achievementGradient: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    lockedIcon: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    achievementIcon: {
        fontSize: 32,
    },
    achievementInfo: {
        flex: 1,
    },
    achievementTitle: {
        fontSize: 16,
        color: '#E1E2E1',
        fontFamily: 'Papyrus',
        marginBottom: 4,
    },
    achievementDescription: {
        fontSize: 13,
        color: '#B0BEC5',
        fontFamily: 'Papyrus',
    },
    lockedText: {
        opacity: 0.6,
    },
    progressContainer: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
        overflow: 'hidden',
        marginRight: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFD700',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        color: '#FFD700',
        fontFamily: 'Papyrus',
        minWidth: 40,
    },
    reward: {
        fontSize: 13,
        color: '#FFD700',
        fontFamily: 'Papyrus',
        marginTop: 4,
    },
});

export default AchievementsModal;
