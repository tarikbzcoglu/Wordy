import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TUTORIAL_STEPS = [
    {
        title: 'Welcome to Wordy!',
        description: 'A fun word puzzle game where you solve questions across different categories.',
        animation: require('../assets/images/owl_hi.json'),
        secondaryAnimation: require('../assets/images/generalKnowledge.json'),
    },
    {
        title: 'Read & Answer',
        description: 'Read the questions carefully and fill in the answers using the on-screen keyboard.',
        animation: require('../assets/images/owl_idle.json'),
        secondaryAnimation: require('../assets/images/history&civilization.json'),
    },
    {
        title: 'Auto-Reveal Magic',
        description: 'When you answer correctly, matching letters automatically appear in other questions!',
        animation: require('../assets/images/owl_idle2.json'),
        secondaryAnimation: require('../assets/images/feather.json'),
        secondaryAnimationStyle: { width: 120, height: 120, marginTop: -20, marginBottom: -20 },
    },
    {
        title: 'Use Hints Wisely',
        description: 'Stuck? Use hints to reveal letters. Watch ads to earn more hints!',
        animation: require('../assets/images/owl_idle3.json'),
        secondaryAnimation: require('../assets/images/hint.json'),
    },
    {
        title: 'Ready to Play!',
        description: 'Complete all questions to advance levels. Good luck!',
        animation: require('../assets/images/owl_levelup2.json'),
        secondaryAnimation: require('../assets/images/rocket.json'),
    },
];

const TutorialModal = ({ isVisible, onComplete, steps = TUTORIAL_STEPS }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            // Entrance animations
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0);
            setCurrentStep(0);
        }
    }, [isVisible]);

    useEffect(() => {
        if (isVisible) {
            // Slide animation when step changes
            slideAnim.setValue(0);
            Animated.spring(slideAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
    }, [currentStep, isVisible]);

    if (!isVisible) {
        return null;
    }

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const step = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Animated.View
                style={[
                    styles.modalBox,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Skip Button */}
                {!isLastStep && (
                    <Pressable style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </Pressable>
                )}

                {/* Lottie Animation */}
                <Animated.View
                    style={[
                        styles.animationContainer,
                        {
                            opacity: slideAnim,
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <LottieView
                        source={step.animation}
                        autoPlay
                        loop={true}
                        style={styles.lottieAnimation}
                    />
                </Animated.View>

                {/* Step Content */}
                <Animated.View
                    style={[
                        styles.contentContainer,
                        {
                            opacity: slideAnim,
                            transform: [
                                {
                                    translateX: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <Text style={styles.titleText}>{step.title}</Text>
                    {step.secondaryAnimation && (
                        <LottieView
                            source={step.secondaryAnimation}
                            autoPlay
                            loop
                            style={[styles.secondaryAnimation, step.secondaryAnimationStyle]}
                        />
                    )}
                    <Text style={styles.descriptionText}>{step.description}</Text>
                </Animated.View>

                {/* Progress Dots */}
                <View style={styles.dotsContainer}>
                    {steps.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentStep && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>

                {/* Navigation Buttons */}
                <View style={styles.buttonsContainer}>
                    {currentStep > 0 && (
                        <Pressable
                            style={[styles.button, styles.previousButton]}
                            onPress={handlePrevious}
                        >
                            <Text style={styles.buttonText}>← Previous</Text>
                        </Pressable>
                    )}
                    <Pressable
                        style={[
                            styles.button,
                            styles.nextButton,
                            currentStep === 0 && styles.singleButton,
                        ]}
                        onPress={handleNext}
                    >
                        <Text style={styles.buttonText}>
                            {isLastStep ? "Let's Play!" : 'Next →'}
                        </Text>
                    </Pressable>
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 3000,
    },
    modalBox: {
        width: '90%',
        maxWidth: 400,
        paddingHorizontal: 24,
        paddingVertical: 24,
        backgroundColor: '#175b72ff',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#ffd900db',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.45,
        shadowRadius: 10,
        elevation: 15,
    },
    skipButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        paddingHorizontal: 15,
        paddingVertical: 8,
        backgroundColor: 'rgba(110, 90, 90, 0.33)',
        borderRadius: 15,
        zIndex: 10,
    },
    skipButtonText: {
        color: '#B0BEC5',
        fontSize: 14,
        fontFamily: 'EagleLake-Regular',
    },
    animationContainer: {
        marginBottom: 10,
    },
    lottieAnimation: {
        width: 150,
        height: 150,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    secondaryAnimation: {
        width: 60,
        height: 60,
        marginBottom: 5,
        marginTop: 5,
    },
    titleText: {
        color: '#FFD700',
        fontSize: 28,
        fontFamily: 'EagleLake-Regular',
        marginBottom: 5,
        textAlign: 'center',
        textShadowColor: 'rgba(255, 215, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    descriptionText: {
        color: '#E1E2E1',
        fontSize: 16,
        fontFamily: 'EagleLake-Regular',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 10,
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: 25,
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeDot: {
        backgroundColor: '#FFD700',
        width: 25,
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 10,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previousButton: {
        backgroundColor: '#be821fff',
    },
    nextButton: {
        backgroundColor: '#1eb660ff',
    },
    singleButton: {
        flex: 1,
    },
    buttonText: {
        color: '#E1E2E1',
        fontSize: 18,
        fontFamily: 'EagleLake-Regular',
    },
});

export default TutorialModal;
