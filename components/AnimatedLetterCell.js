import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedLetterCell = ({ letter, status, width, height, isSelected, isCorrect, onPress, disabled, wordLength = 0 }) => {
    // boxScale controls the container (the cell itself) - starts at 1 so it's visible!
    const boxScale = useRef(new Animated.Value(1)).current;
    // textScale controls the letter pop-in effect
    const textScale = useRef(new Animated.Value(letter ? 1 : 0)).current;

    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    // Handle Letter Pop-in (Text Animation)
    useEffect(() => {
        if (letter) {
            // Letter pops in
            Animated.spring(textScale, {
                toValue: 1,
                friction: 6,
                tension: 200,
                useNativeDriver: true,
            }).start();

            // Subtle box pulse when letter is entered
            Animated.sequence([
                Animated.timing(boxScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                Animated.timing(boxScale, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        } else {
            textScale.setValue(0);
        }
    }, [letter]);

    // Handle Status Changes (Hint/Reveal Animations)
    useEffect(() => {
        if (status === 'revealed' || status === 'hint') {
            // Premium Gold Reveal: Flash -> Materialize -> Sheen -> Settle
            Animated.sequence([
                // 1. Initial Scale Down (Anticipation)
                Animated.timing(boxScale, {
                    toValue: 0.9,
                    duration: 100,
                    useNativeDriver: true,
                }),
                // 2. Flash & Pop (Expansion)
                Animated.parallel([
                    Animated.spring(boxScale, {
                        toValue: 1.1,
                        friction: 5,
                        tension: 200,
                        useNativeDriver: true,
                    }),
                    // Flash effect (using glowAnim as white flash overlay)
                    Animated.sequence([
                        Animated.timing(glowAnim, {
                            toValue: 1, // Full white opacity
                            duration: 100,
                            useNativeDriver: true,
                        }),
                        Animated.timing(glowAnim, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
                // 3. Sharp Sheen (Shimmer)
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                // 4. Settle to natural size
                Animated.spring(boxScale, {
                    toValue: 1,
                    friction: 7,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                shimmerAnim.setValue(0);
            });
        }
    }, [status]);

    // Interpolations
    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width * 2] // Start further left, move further right
    });

    const flashOpacity = glowAnim; // Re-purposing glowAnim as flash

    return (
        <View>
            <AnimatedPressable
                style={[
                    styles.letterCell,
                    { width, height, overflow: 'hidden' },
                    isSelected && styles.selectedCell,
                    isCorrect && styles.correctAnswerCell,
                    status === 'incorrect' && styles.incorrectAnswerCell,
                    status === 'hint' && styles.hintLetterCell,
                    { transform: [{ scale: boxScale }] } // Apply box scale
                ]}
                onPress={onPress}
                disabled={disabled}
            >
                {/* Text Content with its own animation */}
                <Animated.View style={{ transform: [{ scale: textScale }] }}>
                    <Text style={[
                        styles.letterText,
                        { fontSize: (width < 30 ? 20 : 24) + (wordLength <= 9 ? 4 : 0) }
                    ]}>
                        {letter}
                    </Text>
                </Animated.View>

                {/* The "Sheen" - A crisp diagonal shine */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -height,
                        left: 0,
                        width: width * 0.5,
                        height: height * 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        transform: [
                            { translateX: shimmerTranslate },
                            { rotate: '20deg' }
                        ],
                    }}
                />

                {/* The "Flash" - Full white overlay for pop effect */}
                <Animated.View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: '#FFFFFF',
                        opacity: flashOpacity,
                    }}
                />
            </AnimatedPressable>
        </View>
    );
};

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
        backgroundColor: '#81C784',
        borderColor: '#4CAF50',
        borderWidth: 2,
        shadowColor: '#4CAF50',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
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
