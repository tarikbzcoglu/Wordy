import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getPlayerStats } from '../utils/achievementUtils';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StatsModal = ({ isVisible, onClose }) => {
    const [stats, setStats] = useState(null);
    const [username, setUsername] = useState('Player');

    useEffect(() => {
        if (isVisible) {
            loadStats();
            loadUsername();
        }
    }, [isVisible]);

    const loadUsername = async () => {
        try {
            const savedUsername = await AsyncStorage.getItem('username');
            if (savedUsername) {
                setUsername(savedUsername);
            }
        } catch (error) {
            console.error('Failed to load username:', error);
        }
    };

    const loadStats = async () => {
        let playerStats = await getPlayerStats();

        // If stats don't exist yet, create default structure
        if (!playerStats) {
            playerStats = {
                total_levels_completed: 0,
                total_stars: 0,
                current_streak: 0,
                longest_streak: 0,
                perfect_levels: 0,
                no_mistake_levels: 0,
                no_hint_levels: 0,
                fast_levels: 0,
                category_levels: {},
            };
        }

        // Fetch endless high score
        const endlessHigh = await AsyncStorage.getItem('high_score_endless');
        playerStats.high_score_endless = endlessHigh ? parseInt(endlessHigh, 10) : 0;
        setStats(playerStats);
    };

    if (!stats) return null;

    const StatCard = ({ title, value, iconSource, color, iconStyle, titleStyle, valueStyle }) => (
        <View style={styles.statCardContainer}>
            <LinearGradient
                colors={color}
                style={styles.statCard}
            >
                <LottieView
                    source={iconSource}
                    autoPlay
                    loop
                    style={iconStyle || styles.statIcon}
                />
                <Text style={[styles.statValue, valueStyle]}>{value}</Text>
                <Text style={[styles.statTitle, titleStyle]}>{title}</Text>
            </LinearGradient>
        </View>
    );

    const DetailRow = ({ label, value, subtext }) => (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.detailValue}>{value}</Text>
                {subtext && <Text style={styles.detailSubtext}>{subtext}</Text>}
            </View>
        </View>
    );

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
                        <View style={styles.headerTitleContainer}>
                            <LottieView
                                source={require('../assets/images/stats.json')}
                                autoPlay
                                loop
                                style={styles.headerStatsAnimation}
                            />
                            <Text style={styles.headerTitle}>{username}</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>

                        {/* Summary Section */}
                        <View style={styles.summaryContainer}>


                            <View style={styles.statsGrid}>
                                <StatCard
                                    title="Levels"
                                    value={stats.total_levels_completed}
                                    iconSource={require('../assets/images/Achievements.json')}
                                    color={['#3498DB', '#2980B9']}
                                />
                                <StatCard
                                    title="Stars"
                                    value={stats.total_stars}
                                    iconSource={require('../assets/images/star.json')}
                                    iconStyle={styles.starIconLarge}
                                    valueStyle={{ marginTop: -25 }}
                                    titleStyle={{ marginTop: 0 }}
                                    color={['#F1C40F', '#F39C12']}
                                />
                            </View>

                            <View style={styles.streakContainer}>
                                <LinearGradient colors={['#E74C3C', '#C0392B']} style={styles.streakCard}>
                                    <View style={styles.streakInfo}>
                                        <LottieView
                                            source={require('../assets/images/streak.json')}
                                            autoPlay
                                            loop
                                            style={styles.streakIcon}
                                        />
                                        <View>
                                            <Text style={styles.streakValue}>{stats.current_streak} Day Streak</Text>
                                            <Text style={styles.streakSub}>Best: {stats.longest_streak || stats.current_streak} days</Text>
                                        </View>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>

                        {/* Performance Details */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Performance</Text>
                            <View style={styles.detailsCard}>
                                <DetailRow
                                    label="Endless Mode High Score"
                                    value={stats.high_score_endless}
                                />
                                <View style={styles.divider} />
                                <DetailRow
                                    label="Perfect Levels (3 Stars)"
                                    value={stats.perfect_levels}
                                    subtext={`${Math.round((stats.perfect_levels / (stats.total_levels_completed || 1)) * 100)}%`}
                                />
                                <View style={styles.divider} />
                                <DetailRow
                                    label="No Mistakes"
                                    value={stats.no_mistake_levels}
                                />
                                <View style={styles.divider} />
                                <DetailRow
                                    label="No Hints Used"
                                    value={stats.no_hint_levels}
                                />
                                <View style={styles.divider} />
                                <DetailRow
                                    label="Speedster (<30s)"
                                    value={stats.fast_levels}
                                />
                            </View>
                        </View>

                        {/* Category Progress */}
                        <View style={[styles.sectionContainer, { marginBottom: 30 }]}>
                            <Text style={styles.sectionTitle}>Category Progress</Text>
                            <View style={styles.detailsCard}>
                                {stats.category_levels && (() => {
                                    const entries = Object.entries(stats.category_levels);
                                    // Separate endless mode from other categories
                                    const endlessEntry = entries.find(([cat]) => cat === 'karışık');
                                    const otherEntries = entries
                                        .filter(([cat]) => cat !== 'karışık')
                                        .sort(([, lvlA], [, lvlB]) => lvlB - lvlA);

                                    // Combine with endless mode first
                                    const sortedEntries = endlessEntry
                                        ? [endlessEntry, ...otherEntries]
                                        : otherEntries;

                                    return sortedEntries.map(([cat, lvl], index) => (
                                        <View key={cat}>
                                            <DetailRow
                                                label={cat === 'karışık' ? 'Endless Mode' : cat}
                                                value={cat === 'karışık' ? `High Score: ${stats.high_score_endless}` : `Lvl ${lvl}`}
                                            />
                                            {index < sortedEntries.length - 1 && <View style={styles.divider} />}
                                        </View>
                                    ));
                                })()}
                                {(!stats.category_levels || Object.keys(stats.category_levels).length === 0) && (
                                    <Text style={styles.emptyText}>Play levels to see progress!</Text>
                                )}
                            </View>
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
        height: SCREEN_HEIGHT * 0.85,
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
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerStatsAnimation: {
        width: 32,
        height: 32,
    },
    headerTitle: {
        fontSize: 26,
        color: '#FFD700',
        fontFamily: 'EagleLake-Regular',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#E1E2E1',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    summaryContainer: {
        marginBottom: 25,
    },
    coinBadge: {
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFD700',
    },
    coinText: {
        color: '#FFD700',
        fontSize: 20,
        fontFamily: 'EagleLake-Regular',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    statCardContainer: {
        width: '48%',
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
    },
    statCard: {
        padding: 0,
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: 122,
        gap: 8,
    },
    statIcon: {
        width: 36,
        height: 36,
        marginTop: 10,
    },
    starIconLarge: {
        width: 100,
        height: 100,
        marginTop: -30,
    },
    statValue: {
        fontSize: 24,
        color: '#FFF',
        fontFamily: 'EagleLake-Regular',
    },
    statTitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'EagleLake-Regular',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    streakContainer: {
        borderRadius: 15,
        overflow: 'hidden',
        elevation: 5,
    },
    streakCard: {
        padding: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    streakInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    streakIcon: {
        width: 40,
        height: 40,
        marginRight: 15,
    },
    streakValue: {
        fontSize: 20,
        color: '#FFF',
        fontFamily: 'EagleLake-Regular',
    },
    streakSub: {
        fontSize: 12,
        color: '#FFD700',
        fontFamily: 'EagleLake-Regular',
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        color: '#FFD700',
        fontSize: 18,
        fontFamily: 'EagleLake-Regular',
        marginBottom: 10,
        marginLeft: 5,
    },
    detailsCard: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    detailLabel: {
        color: '#efcd37ff',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
    },
    detailValue: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
    },
    detailSubtext: {
        color: '#95A5A6',
        fontSize: 12,
        fontFamily: 'EagleLake-Regular',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        marginVertical: 4,
    },
    emptyText: {
        color: '#95A5A6',
        textAlign: 'center',
        fontFamily: 'EagleLake-Regular',
        fontStyle: 'italic',
        padding: 10,
    }
});

export default StatsModal;
