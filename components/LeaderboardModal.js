import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getLeaderboard } from '../utils/leaderboardUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CATEGORIES = [
    'Mixed Categories',
    'Planet Earth',
    'General Knowledge',
    'Science & Nature',
    'Food & Culture',
    'History & Civilization',
    'Movies & Pop Culture',
    'Art & Literature',
    'Games & Technology',
    'Travel & Geography',
];

const LeaderboardModal = ({ isVisible, onClose }) => {
    const [scores, setScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Mixed Categories');
    const [userRank, setUserRank] = useState(null);
    const [userScore, setUserScore] = useState(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Animate Entrance
    useEffect(() => {
        if (isVisible) {
            // Reset state on open
            loadScores();
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
            slideAnim.setValue(50);
        }
    }, [isVisible]);

    // Reload scores when category changes
    useEffect(() => {
        if (isVisible) {
            loadScores();
        }
    }, [selectedCategory]);

    const loadScores = async () => {
        setLoading(true);
        const data = await getLeaderboard(50, selectedCategory);
        setScores(data);

        // Find user's rank
        try {
            const userId = await AsyncStorage.getItem('user_id');
            if (userId) {
                const userIndex = data.findIndex(item => item.userId === userId);
                if (userIndex !== -1) {
                    setUserRank({ userId, rank: userIndex + 1 });
                    setUserScore(data[userIndex].score);
                } else {
                    setUserRank(null);
                    setUserScore(null);
                }
            }
        } catch (error) {
            console.error('Error finding user rank:', error);
        }

        setLoading(false);
    };

    const renderItem = ({ item, index }) => {
        let rankColor = '#E1E2E1';
        let iconName = 'medal-outline';
        const isCurrentUser = item.userId === userRank?.userId;

        if (index === 0) { rankColor = '#FFD700'; iconName = 'trophy'; } // Gold
        else if (index === 1) { rankColor = '#C0C0C0'; iconName = 'medal'; } // Silver
        else if (index === 2) { rankColor = '#CD7F32'; iconName = 'medal'; } // Bronze

        return (
            <View style={[
                styles.row,
                index % 2 === 0 ? styles.evenRow : styles.oddRow,
                isCurrentUser && styles.currentUserRow
            ]}>
                <View style={styles.rankCol}>
                    {isCurrentUser ? (
                        <Text style={styles.rankText}>🏆 #{index + 1}</Text>
                    ) : index < 3 ? (
                        <Ionicons name={iconName} size={20} color={rankColor} />
                    ) : (
                        <Text style={styles.rankText}>{index + 1}</Text>
                    )}
                </View>
                <Text style={[styles.userText, index < 3 && { color: rankColor }]}>
                    {item.username || 'Anonymous'}
                </Text>
                <Text style={[styles.scoreText, index < 3 && { color: rankColor }]}>
                    {item.score}
                </Text>
            </View>
        );
    };

    if (!isVisible) return null;

    return (
        <Modal transparent visible={isVisible} onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Animated.View style={[styles.modalContent, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <LottieView
                                source={require('../assets/images/Achievements.json')}
                                autoPlay
                                loop
                                style={styles.headerIcon}
                            />
                            <Text style={styles.title}>Global Rankings</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </Pressable>
                    </View>

                    {/* Category Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryTabs}
                        contentContainerStyle={styles.categoryTabsContent}
                    >
                        {CATEGORIES.map((cat) => (
                            <Pressable
                                key={cat}
                                style={[
                                    styles.categoryTab,
                                    selectedCategory === cat && styles.categoryTabActive
                                ]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[
                                    styles.categoryTabText,
                                    selectedCategory === cat && styles.categoryTabTextActive
                                ]}>
                                    {cat === 'Mixed Categories' ? 'Endless' : cat}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>

                    {/* Loading Indicator */}
                    {loading ? (
                        <View style={styles.centerContainer}>
                            <Text style={styles.loadingText}>Loading Scores...</Text>
                        </View>
                    ) : (
                        <>
                            {/* List Header */}
                            <View style={styles.listHeader}>
                                <Text style={[styles.headerText, { flex: 0.2 }]}>#</Text>
                                <Text style={[styles.headerText, { flex: 0.5, textAlign: 'left' }]}>Player</Text>
                                <Text style={[styles.headerText, { flex: 0.3, textAlign: 'center' }]}>Score</Text>
                            </View>

                            {scores.length === 0 ? (
                                <View style={styles.centerContainer}>
                                    <Text style={styles.emptyText}>No rankings yet. Be the first!</Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={scores}
                                    renderItem={renderItem}
                                    keyExtractor={(item, index) => index.toString()}
                                    style={styles.list}
                                    showsVerticalScrollIndicator={false}
                                />
                            )}
                        </>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        width: '90%',
        height: '70%',
        backgroundColor: '#1C3B4F',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFD700',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderBottomWidth: 1,
        borderBottomColor: '#4A7E8E',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIcon: {
        width: 32,
        height: 32,
    },
    title: {
        fontSize: 22,
        color: '#FFD700',
        fontFamily: 'EagleLake-Regular',
    },
    closeBtn: {
        padding: 5,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#E1E2E1',
        fontFamily: 'EagleLake-Regular',
        fontSize: 16,
    },
    emptyText: {
        color: '#B0BEC5',
        fontFamily: 'EagleLake-Regular',
        fontSize: 16,
        fontStyle: 'italic',
    },
    listHeader: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#4A7E8E',
        borderBottomWidth: 1,
        borderBottomColor: '#1C3B4F',
    },
    headerText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
        textAlign: 'center',
    },
    list: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    evenRow: {
        backgroundColor: 'rgba(255,255,255,0.03)',
    },
    oddRow: {
        backgroundColor: 'transparent',
    },
    rankCol: {
        flex: 0.2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        color: '#E1E2E1',
        fontSize: 14,
        fontFamily: 'EagleLake-Regular',
    },
    userText: {
        flex: 0.5,
        color: '#E1E2E1',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
        textAlign: 'left',
    },
    scoreText: {
        flex: 0.3,
        color: '#FFD700',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
        textAlign: 'center',
    },
    currentUserRow: {
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        borderLeftWidth: 4,
        borderLeftColor: '#FFD700',
    },
    categoryTabs: {
        maxHeight: 55,
        borderBottomWidth: 1,
        borderBottomColor: '#4A7E8E',
    },
    categoryTabsContent: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 8,
    },
    categoryTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryTabActive: {
        backgroundColor: 'rgba(255, 215, 0, 0.2)',
        borderColor: '#FFD700',
    },
    categoryTabText: {
        color: '#B0BEC5',
        fontSize: 14,
        fontFamily: 'EagleLake-Regular',
    },
    categoryTabTextActive: {
        color: '#FFD700',
    },
});

export default LeaderboardModal;
