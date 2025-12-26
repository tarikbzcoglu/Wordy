import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const GameOverModal = ({ isVisible, score, isNewHighScore, onPlayAgain, onBackToMenu }) => {
    const scaleAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (isVisible) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [isVisible]);

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            animationType="fade"
            onRequestClose={() => { }} // Prevent back button close on Android
        >
            <View style={styles.container}>
                <Animated.View style={[styles.modalBox, { transform: [{ scale: scaleAnim }] }]}>

                    {/* Lottie Animation */}
                    <LottieView
                        source={require('../assets/images/gameover.json')}
                        autoPlay
                        loop={false}
                        style={styles.lottieAnimation}
                    />

                    <View style={styles.scoreContainer}>
                        {isNewHighScore && (
                            <View style={styles.highScoreContainer}>
                                <LottieView
                                    source={require('../assets/images/milestone.json')}
                                    autoPlay
                                    loop={false}
                                    style={styles.milestoneAnimation}
                                />
                                <Text style={styles.newHighScoreText}>NEW HIGH SCORE!</Text>
                            </View>
                        )}
                        <Text style={styles.scoreLabel}>Final Score</Text>
                        <Text style={styles.scoreValue}>{score}</Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        {/* Play Again Button - Warm/Hot Orange-Red */}
                        <Pressable onPress={onPlayAgain} style={styles.buttonWrapper}>
                            <LinearGradient
                                colors={['#FF512F', '#DD2476']} // Hot Pink/Red
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <LottieView
                                    source={require('../assets/images/play.json')}
                                    autoPlay
                                    loop
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.buttonText}>Play Again</Text>
                            </LinearGradient>
                        </Pressable>

                        {/* Back to Menu Button - Deep Dark Red */}
                        <Pressable onPress={onBackToMenu} style={styles.buttonWrapper}>
                            <LinearGradient
                                colors={['#800000', '#4A0000']} // Maroon / Dark Red
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <LottieView
                                    source={require('../assets/images/exit.json')}
                                    autoPlay
                                    loop
                                    style={styles.buttonIcon}
                                />
                                <Text style={styles.buttonText}>Menu</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>

                </Animated.View>

                {/* Fireworks Overlay for New High Score */}
                {isNewHighScore && (
                    <View style={styles.fireworksContainer}>
                        <LottieView
                            source={require('../assets/images/fireworks.json')}
                            autoPlay
                            loop={true}
                            style={styles.fireworksAnimation}
                        />
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Very dark overlay
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '85%',
        backgroundColor: '#2C0E0E', // Dark Red/Brown background
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FF5252', // Bright Red border
        shadowColor: '#FF5252', // Red Glow
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
        elevation: 20,
    },
    lottieAnimation: {
        width: 200,
        height: 150,
        marginBottom: 10,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingVertical: 10,
        paddingHorizontal: 40,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.3)',
        width: '100%',
        alignItems: 'center',
    },
    highScoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    milestoneAnimation: {
        width: 60,
        height: 60,
        // Removed absolute positioning
    },
    newHighScoreText: {
        color: '#FFD700',
        fontSize: 22,
        fontFamily: 'EagleLake-Regular',
        fontWeight: 'bold',
        textShadowColor: 'rgba(255, 215, 0, 0.8)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        marginLeft: 10, // Spacing from animation
    },
    scoreLabel: {
        color: '#FFCDD2', // Light Red
        fontSize: 18,
        fontFamily: 'EagleLake-Regular',
        marginBottom: 5,
    },
    scoreValue: {
        color: '#FF5252', // Bright Red/Orange
        fontSize: 48,
        fontFamily: 'EagleLake-Regular',
        fontWeight: 'bold',
        textShadowColor: 'rgba(255, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    buttonContainer: {
        width: '100%',
        gap: 15,
    },
    buttonWrapper: {
        width: '100%',
        borderRadius: 25,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'EagleLake-Regular',
        fontWeight: '600',
        marginLeft: 10,
    },
    buttonIcon: {
        width: 40,
        height: 40,
        marginRight: 0,
    },
    fireworksContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
        pointerEvents: 'none',
    },
    fireworksAnimation: {
        width: 400,
        height: 400,
    },
});

export default GameOverModal;
