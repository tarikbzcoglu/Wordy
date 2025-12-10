import LottieView from 'lottie-react-native';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AchievementToast = ({ achievement, isVisible, onHide }) => {
    const slideAnim = useRef(new Animated.Value(-150)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        if (isVisible && achievement) {
            // Slide in + scale animation
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide after 3 seconds
            const timer = setTimeout(() => {
                hideToast();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, achievement]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (onHide) onHide();
        });
    };

    if (!isVisible || !achievement) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim },
                    ],
                },
            ]}
        >
            <View style={styles.toastBox}>
                {/* Achievement Icon */}
                <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{achievement.icon}</Text>
                </View>

                {/* Achievement Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>🏆 Başarım Kazanıldı!</Text>
                    <Text style={styles.title}>{achievement.title}</Text>
                    <Text style={styles.description}>{achievement.description}</Text>

                </View>

                {/* Celebration Animation (optional) */}
                <View style={styles.celebrationContainer}>
                    <LottieView
                        source={require('../assets/images/milestone.json')}
                        autoPlay
                        loop={false}
                        style={styles.celebration}
                    />
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 9999,
    },
    toastBox: {
        width: SCREEN_WIDTH * 0.9,
        maxWidth: 400,
        backgroundColor: '#1C3B4F',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#FFD700',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
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
    icon: {
        fontSize: 36,
    },
    infoContainer: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: '#FFD700',
        fontFamily: 'EagleLake-Regular',
        marginBottom: 4,
    },
    title: {
        fontSize: 20,
        color: '#E1E2E1',
        fontFamily: 'EagleLake-Regular',
        marginBottom: 2,
    },
    description: {
        fontSize: 13,
        color: '#B0BEC5',
        fontFamily: 'EagleLake-Regular',
    },
    reward: {
        fontSize: 14,
        color: '#FFD700',
        fontFamily: 'EagleLake-Regular',
        marginTop: 4,
    },
    celebrationContainer: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        pointerEvents: 'none',
    },
    celebration: {
        width: '100%',
        height: '100%',
    },
});

export default AchievementToast;
