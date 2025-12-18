import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import ProgressBar from './ProgressBar';

const GameHeader = ({
    navigation,
    playTapSound,
    isEndlessMode,
    endlessScore,
    scoreScaleAnim,
    mistakesRemaining,
    showHeartRewardAd,
    category,
    level,
    correctlyAnswered,
    totalQuestions,
    hintsLeft,
    onHint,
    isHintHighlighted,
    onSettings,
}) => {
    // Owl animation for header
    const [headerOwlAnim, setHeaderOwlAnim] = useState(1);
    const hintButtonPulseAnim = useRef(new Animated.Value(1)).current;

    const getHeaderOwlSource = () => {
        // 6 animations: idle 1-4, sleep 1-2
        if (headerOwlAnim === 1) return require('../assets/images/owl_idle.json');
        if (headerOwlAnim === 2) return require('../assets/images/owl_idle2.json');
        if (headerOwlAnim === 3) return require('../assets/images/owl_idle3.json');
        if (headerOwlAnim === 4) return require('../assets/images/owl_idle4.json');
        if (headerOwlAnim === 5) return require('../assets/images/owl_sleep.json');
        return require('../assets/images/owl_sleep2.json');
    };

    // Change header owl animation every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setHeaderOwlAnim(Math.floor(Math.random() * 6) + 1); // Random 1-6
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, []);

    // Animate hint button pulse when highlighted
    useEffect(() => {
        if (isHintHighlighted) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(hintButtonPulseAnim, {
                        toValue: 1.1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(hintButtonPulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        } else {
            hintButtonPulseAnim.setValue(1);
        }
    }, [isHintHighlighted]);

    return (
        <View style={styles.header}>
            <Pressable
                style={styles.backButtonModern}
                onPress={() => { playTapSound?.(); navigation.goBack(); }}
            >
                {({ pressed }) => (
                    <View style={[
                        styles.backButtonInner,
                        { backgroundColor: pressed ? '#3A6A7A' : '#4A7E8E' }
                    ]}>
                        <Text style={styles.backButtonTextModern}>←</Text>
                    </View>
                )}
            </Pressable>


            {/* Header Info - Conditional for Endless vs Classic */}
            <View style={styles.planetInfo}>
                <LottieView
                    source={getHeaderOwlSource()}
                    autoPlay
                    loop
                    style={styles.headerOwlAnimation}
                />

                {isEndlessMode ? (
                    <>
                        <Animated.Text style={[styles.scoreText, { transform: [{ scale: scoreScaleAnim }] }]}>
                            Score: {endlessScore}
                        </Animated.Text>
                        <View style={styles.heartsContainer}>
                            {[...Array(5)].map((_, i) => (
                                <AntDesign
                                    key={i}
                                    name="heart"
                                    size={20}
                                    color={i < mistakesRemaining ? "#FF5252" : "rgba(255, 82, 82, 0.3)"}
                                    style={styles.heartIcon}
                                />
                            ))}
                            {mistakesRemaining < 5 && (
                                <Pressable
                                    onPress={showHeartRewardAd}
                                    style={styles.adButton}
                                >
                                    <Text style={styles.adButtonText}>Ad</Text>
                                </Pressable>
                            )}
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={styles.levelText}>{category} - Level {level}</Text>
                        <ProgressBar
                            current={correctlyAnswered}
                            total={totalQuestions}
                            style={{ width: 160 }}
                        />
                    </>
                )}
            </View>


            <Animated.View
                style={[
                    styles.hintButtonContainer,
                    isHintHighlighted && {
                        transform: [{ scale: hintButtonPulseAnim }]
                    }
                ]}
            >
                <Pressable
                    onPress={onHint}
                    style={styles.hintButtonNoBg}
                >
                    {isHintHighlighted ? (
                        <LinearGradient
                            colors={['#DAA520', '#FF8C00', '#DAA520']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.hintButtonGradientNoBg}
                        >
                            <LottieView
                                source={require('../assets/images/hint.json')}
                                autoPlay
                                loop
                                style={styles.hintAnimationLarge}
                            />
                        </LinearGradient>
                    ) : (
                        <LottieView
                            source={require('../assets/images/hint.json')}
                            autoPlay
                            loop
                            style={styles.hintAnimationLarge}
                        />
                    )}
                </Pressable>
                <Text style={styles.hintButtonTextBelow}>Hints: {hintsLeft}</Text>
            </Animated.View>
            <Pressable
                style={styles.settingsButtonModern}
                onPress={() => { playTapSound?.(); onSettings(); }}
            >
                {({ pressed }) => (
                    <View style={[
                        styles.settingsButtonInner,
                        { backgroundColor: pressed ? '#3A6A7A' : '#4A7E8E' }
                    ]}>
                        <View style={styles.hamburgerLine} />
                        <View style={styles.hamburgerLine} />
                        <View style={styles.hamburgerLine} />
                    </View>
                )}
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 2,
        paddingTop: 0,
        backgroundColor: '#1C3B4F',
        borderBottomWidth: 1,
        borderBottomColor: '#4A7E8E',
    },
    backButtonModern: {
        width: 42,
        height: 36,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    backButtonInner: {
        width: 42,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    backButtonTextModern: {
        color: '#E1E2E1',
        fontSize: 36,
        fontFamily: 'EagleLake-Regular',
        marginTop: -14,
    },
    settingsButtonModern: {
        width: 42,
        height: 36,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    settingsButtonInner: {
        width: 42,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        paddingVertical: 8,
        gap: 4,
    },
    hamburgerLine: {
        width: 20,
        height: 3,
        backgroundColor: '#E1E2E1',
        borderRadius: 1.5,
    },
    hintButtonContainer: {
        alignItems: 'center',
        marginRight: 25,
    },
    hintAnimationLarge: {
        width: 55,
        height: 55,
    },
    hintButtonNoBg: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    hintButtonGradientNoBg: {
        width: 55,
        height: 55,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 15,
        elevation: 10,
    },
    hintButtonTextBelow: {
        color: '#E1E2E1',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
        marginTop: 0,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    planetInfo: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heartIcon: {
        fontSize: 24,
    },
    headerOwlAnimation: {
        width: 50,
        height: 50,
        marginBottom: 0,
        marginRight: 40,
    },
    levelText: {
        color: '#e0cb0bff',
        fontSize: 11,
        fontFamily: 'EagleLake-Regular',
        marginRight: 5,
        marginLeft: 0,
    },
    scoreText: {
        color: '#FFD700',
        fontSize: 22,
        fontFamily: 'EagleLake-Regular',
        marginBottom: 4,
        marginRight: 35,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    heartsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 35,
        gap: 4,
    },
    adButton: {
        marginLeft: 6,
        backgroundColor: '#4CAF50',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#66BB6A',
    },
    adButtonText: {
        color: '#FFF',
        fontSize: 11,
        fontFamily: 'EagleLake-Regular',
    },
});

export default GameHeader;
