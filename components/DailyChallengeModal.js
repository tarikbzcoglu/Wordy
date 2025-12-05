import { LinearGradient } from 'expo-linear-gradient';
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
import { claimBonusReward, claimTaskReward, getDailyTasks } from '../utils/dailyTaskUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DailyChallengeModal = ({ isVisible, onClose }) => {
    const [dailyData, setDailyData] = useState(null);

    useEffect(() => {
        if (isVisible) {
            loadDailyTasks();
        }
    }, [isVisible]);

    const loadDailyTasks = async () => {
        const data = await getDailyTasks();
        setDailyData(data);
    };

    const handleClaimTask = async (taskId) => {
        const success = await claimTaskReward(taskId);
        if (success) {
            loadDailyTasks();
        }
    };

    const handleClaimBonus = async () => {
        const success = await claimBonusReward();
        if (success) {
            loadDailyTasks();
        }
    };

    const renderTask = (task) => {
        const progress = Math.min((task.current / task.target) * 100, 100);
        const isCompleted = task.completed;
        const isClaimed = task.claimed;

        return (
            <View key={task.id} style={styles.taskCard}>
                <LinearGradient
                    colors={['#2C3E50', '#34495E']}
                    style={styles.taskGradient}
                >
                    <View style={styles.taskHeader}>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                        <View style={styles.rewardContainer}>
                            <Text style={styles.rewardText}>{task.reward} 💰</Text>
                        </View>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{task.current}/{task.target}</Text>
                    </View>

                    <View style={styles.actionContainer}>
                        {isClaimed ? (
                            <View style={styles.claimedBadge}>
                                <Text style={styles.claimedText}>CLAIMED</Text>
                            </View>
                        ) : isCompleted ? (
                            <Pressable style={styles.claimButton} onPress={() => handleClaimTask(task.id)}>
                                <LinearGradient
                                    colors={['#27AE60', '#2ECC71']}
                                    style={styles.claimButtonGradient}
                                >
                                    <Text style={styles.claimButtonText}>CLAIM</Text>
                                </LinearGradient>
                            </Pressable>
                        ) : (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.pendingText}>IN PROGRESS</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </View>
        );
    };

    if (!dailyData) return null;

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>📅 Daily Missions</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    {/* Timer / Date Info */}
                    <Text style={styles.dateText}>Date: {dailyData.date}</Text>

                    {/* Tasks List */}
                    <ScrollView style={styles.tasksList}>
                        {dailyData.tasks.map(renderTask)}

                        {/* Bonus Section */}
                        <View style={styles.bonusSection}>
                            <Text style={styles.bonusTitle}>Daily Bonus</Text>
                            <Text style={styles.bonusSubtitle}>Complete all tasks to unlock!</Text>

                            {dailyData.allCompleted ? (
                                dailyData.bonusClaimed ? (
                                    <View style={styles.bonusClaimed}>
                                        <Text style={styles.bonusText}>🎉 Bonus Claimed!</Text>
                                    </View>
                                ) : (
                                    <Pressable style={styles.bonusButton} onPress={handleClaimBonus}>
                                        <LinearGradient
                                            colors={['#F1C40F', '#F39C12']}
                                            style={styles.bonusGradient}
                                        >
                                            <Text style={styles.bonusButtonText}>OPEN CHEST (200 💰)</Text>
                                        </LinearGradient>
                                    </Pressable>
                                )
                            ) : (
                                <View style={styles.bonusLocked}>
                                    <Text style={styles.bonusLockedText}>🔒 Complete All Tasks</Text>
                                </View>
                            )}
                        </View>
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
        maxHeight: SCREEN_HEIGHT * 0.85,
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
        backgroundColor: '#152C3C',
    },
    headerTitle: {
        fontSize: 24,
        color: '#FFD700',
        fontFamily: 'Papyrus',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#E1E2E1',
    },
    dateText: {
        textAlign: 'center',
        color: '#B0BEC5',
        marginTop: 10,
        fontFamily: 'Papyrus',
    },
    tasksList: {
        padding: 16,
    },
    taskCard: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
    },
    taskGradient: {
        padding: 15,
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    taskDescription: {
        color: '#ECJKF1', // White-ish
        fontSize: 16,
        flex: 1,
        marginRight: 10,
        color: '#FFF',
    },
    rewardContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    rewardText: {
        color: '#FFD700',
        fontSize: 14,
        fontWeight: 'bold',
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressBarBg: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginRight: 10,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3498DB',
        borderRadius: 4,
    },
    progressText: {
        color: '#BDC3C7',
        fontSize: 12,
        minWidth: 40,
        textAlign: 'right',
    },
    actionContainer: {
        alignItems: 'flex-end',
    },
    claimButton: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    claimButtonGradient: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    claimButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    claimedBadge: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
    },
    claimedText: {
        color: '#BDC3C7',
        fontSize: 12,
    },
    pendingBadge: {
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    pendingText: {
        color: '#7F8C8D',
        fontSize: 12,
        fontStyle: 'italic',
    },
    bonusSection: {
        marginTop: 20,
        marginBottom: 40,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 20,
        borderRadius: 15,
    },
    bonusTitle: {
        color: '#FFD700',
        fontSize: 20,
        fontFamily: 'Papyrus',
        marginBottom: 5,
    },
    bonusSubtitle: {
        color: '#BDC3C7',
        fontSize: 14,
        marginBottom: 15,
    },
    bonusButton: {
        borderRadius: 25,
        overflow: 'hidden',
        width: '80%',
    },
    bonusGradient: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    bonusButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    bonusLocked: {
        paddingVertical: 12,
        width: '80%',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 25,
    },
    bonusLockedText: {
        color: '#95A5A6',
    },
    bonusClaimed: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    bonusText: {
        color: '#2ECC71',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default DailyChallengeModal;
