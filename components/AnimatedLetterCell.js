
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedLetterCell = React.memo(({
    letter,
    status,
    width,
    height,
    isSelected,
    isCorrect,
    onPress,
    disabled,
    wordLength,
    style,
    correctStyle,
    incorrectStyle,
    hintStyle,
    selectedStyle
}) => {
    // Animation Refs
    const spinAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    // const shimmerAnim = useRef(new Animated.Value(0)).current; // Removed for perf
    // const rainbowAnim = useRef(new Animated.Value(0)).current; // Removed for perf

    // Pulse animation for input/selected state
    const boxScale = useRef(new Animated.Value(1)).current;

    const prevStatus = useRef(status);
    const prevIsSelected = useRef(isSelected);

    // 1. Box Pulse Effect (Input/Selected)
    useEffect(() => {
        if (isSelected && !prevIsSelected.current) {
            Animated.sequence([
                Animated.timing(boxScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                Animated.timing(boxScale, { toValue: 1, duration: 100, useNativeDriver: true })
            ]).start();
        }
        prevIsSelected.current = isSelected;
    }, [isSelected]);

    // Combined Effect for Status Changes
    useEffect(() => {
        if (status === prevStatus.current && status !== 'revealed') return;
        prevStatus.current = status;

        // Reset animations
        spinAnim.setValue(0);
        glowAnim.setValue(0);

        if (status === 'hint') {
            // 2. Hint Reveal: 3D Flip + Glow
            Animated.parallel([
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1, // Flash
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    })
                ])
            ]).start();
        } else if (status === 'revealed') {
            // 3. Reveal: Simple 3D FLip + Flash (No Rainbow/Shimmer for max FPS)
            Animated.parallel([
                // Spin
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 400, // Faster spin
                    useNativeDriver: true,
                }),
                // Simple Flash
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 0.6, // Subtle flash
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [status]);

    // Interpolations
    const spinRotate = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const flashOpacity = glowAnim;

    // Memoize the combined style
    const combinedStyle = React.useMemo(() => [
        styles.letterCell,
        style,
        { width, height, overflow: 'hidden' }, // Ensure hidden overflow for radius
        isSelected && (selectedStyle || styles.selectedCell),
        status === 'incorrect' && (incorrectStyle || styles.incorrectAnswerCell),
        status === 'hint' && (hintStyle || styles.hintLetterCell),
        isCorrect && (correctStyle || styles.correctAnswerCell),
        {
            transform: [
                { scale: boxScale },
                { rotateY: (status === 'hint' || status === 'revealed') ? spinRotate : '0deg' }
            ]
        }
    ], [style, width, height, isSelected, selectedStyle, status, incorrectStyle, hintStyle, isCorrect, correctStyle, boxScale, spinRotate]);

    return (
        <View>
            <AnimatedPressable
                style={combinedStyle}
                onPress={onPress}
                disabled={disabled}
            >
                {/* Optimized: Only 1 Overlay Layer (Flash) and only when needed */}
                {(status === 'revealed' || status === 'hint') && (
                    <Animated.View
                        style={{
                            ...StyleSheet.absoluteFillObject,
                            backgroundColor: 'white',
                            opacity: flashOpacity,
                            borderRadius: 6,
                        }}
                    />
                )}

                {/* Text Content */}
                <Animated.View style={{ zIndex: 100, elevation: 10 }}>
                    <Text style={[
                        styles.letterText,
                        // Dynamic Font Size Logic
                        { fontSize: (width < 38 || wordLength > 9) ? 22 : 32 }
                    ]}>
                        {letter}
                    </Text>
                </Animated.View>

            </AnimatedPressable>
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom Comparison Function for Performance
    return (
        prevProps.letter === nextProps.letter &&
        prevProps.status === nextProps.status &&
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.isCorrect === nextProps.isCorrect &&
        prevProps.width === nextProps.width &&
        prevProps.height === nextProps.height &&
        prevProps.disabled === nextProps.disabled
    );
});

const styles = StyleSheet.create({
    letterCell: {
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 1,
        borderWidth: 2,
        borderColor: 'rgba(28, 59, 79, 0.15)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    selectedCell: {
        backgroundColor: '#FFE082',
        borderColor: '#FFD700',
        borderWidth: 2,
        shadowColor: '#FFD700',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    correctAnswerCell: {
        backgroundColor: '#26A69A', // Daha sofistike bir teal/turkuaz
        borderColor: '#00897B',     // Bir ton koyusu
        borderWidth: 0,             // Kenarlık yerine radius ile yumuşatalım
        borderRadius: 8,
        // Hafif bir iç parlama hissi için
        shadowColor: '#80CBC4',
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
    },
    incorrectAnswerCell: {
        backgroundColor: '#FF8A80',
        borderColor: '#FF6B6B',
        borderWidth: 2,
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    hintLetterCell: {
        backgroundColor: '#FFD700',
        borderColor: '#e7c712ff',
        borderWidth: 2,
        shadowColor: '#95800aff',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    letterText: {
        fontSize: 32,
        color: '#1C3B4F',
        fontFamily: 'EagleLake-Regular',
        textShadowColor: 'rgba(255, 255, 255, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});

export default React.memo(AnimatedLetterCell);
