import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedLetterCell = ({
    letter,
    status,
    width,
    height,
    isSelected,
    isCorrect,
    onPress,
    disabled,
    wordLength = 0,
    // Style overrides
    correctStyle,
    incorrectStyle,
    hintStyle,
    selectedStyle,
    style, // Base style override
}) => {
    // boxScale controls the container (the cell itself)
    const boxScale = useRef(new Animated.Value(1)).current;

    // Animation Values
    const spinAnim = useRef(new Animated.Value(0)).current;     // For 3D rotation
    const glowAnim = useRef(new Animated.Value(0)).current;     // For Neon Flash
    const shimmerAnim = useRef(new Animated.Value(0)).current;  // For Sheen finish
    const rainbowAnim = useRef(new Animated.Value(0)).current;  // For Rainbow colors

    // Handle Letter Entry Pulse (Polished Interaction)
    useEffect(() => {
        if (letter && status !== 'hint' && status !== 'revealed') {
            Animated.sequence([
                Animated.timing(boxScale, { toValue: 1.05, duration: 100, useNativeDriver: true }),
                Animated.timing(boxScale, { toValue: 1, duration: 100, useNativeDriver: true }),
            ]).start();
        }
    }, [letter]);

    // Handle Status Changes (Hint/Reveal Animations)
    useEffect(() => {
        if (status === 'revealed' || status === 'hint') {
            // 🌟 ULTIMATE + RAINBOW COMBO ANIMATION 🌟
            // 3D Spin + Neon Flash + Scale Pulse + Sheen Finish + Rainbow Tint

            spinAnim.setValue(0);
            glowAnim.setValue(0);
            shimmerAnim.setValue(0);
            rainbowAnim.setValue(0);

            // Ensure text is visible!
            // textScale removed to fix visibility issues.

            Animated.parallel([
                // 1. 360 Degree Spin
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 650,
                    useNativeDriver: true,
                }),

                // 2. Pulse Scale
                Animated.sequence([
                    Animated.timing(boxScale, { toValue: 1.15, duration: 325, useNativeDriver: true }),
                    Animated.spring(boxScale, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
                ]),

                // 3. Neon Flash
                Animated.sequence([
                    Animated.delay(100),
                    Animated.timing(glowAnim, { toValue: 0.9, duration: 150, useNativeDriver: true }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
                ]),

                // 4. Sheen Sweep
                Animated.sequence([
                    Animated.delay(550),
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ]),

                // 5. Rainbow Tint Cycle (during spin) - MUST be false for color interpolation
                Animated.sequence([
                    Animated.timing(rainbowAnim, {
                        toValue: 1,
                        duration: 650,
                        useNativeDriver: false,
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

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width * 2]
    });

    const flashOpacity = glowAnim;

    // Rainbow Tint Interpolation
    const rainbowColor = rainbowAnim.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: [
            'rgba(255, 215, 0, 0)',   // Transparent Gold start
            'rgba(255, 0, 0, 0.3)',   // Red tint
            'rgba(255, 0, 255, 0.3)', // Purple tint
            'rgba(0, 255, 255, 0.3)', // Cyan tint
            'rgba(0, 255, 0, 0.3)',   // Green tint
            'rgba(255, 215, 0, 0)'    // Back to Gold/Transparent
        ]
    });

    return (
        <View>
            <AnimatedPressable
                style={[
                    styles.letterCell,
                    style, // Apply external base style override
                    { width, height, overflow: 'hidden' },
                    isSelected && (selectedStyle || styles.selectedCell),
                    status === 'incorrect' && (incorrectStyle || styles.incorrectAnswerCell),
                    status === 'hint' && (hintStyle || styles.hintLetterCell),
                    // isCorrect must be last to override hint style when the word is completed
                    isCorrect && (correctStyle || styles.correctAnswerCell),
                    {
                        transform: [
                            { scale: boxScale },
                            { rotateY: (status === 'hint' || status === 'revealed') ? spinRotate : '0deg' }
                        ]
                    }
                ]}
                onPress={onPress}
                disabled={disabled}
            >
                {/* Rainbow/Holo Overlay Layer */}
                <Animated.View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: rainbowColor,
                        borderRadius: 6,
                    }}
                />

                {/* The "Sheen" - Diagonal light sweep */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: -height,
                        left: 0,
                        width: width * 0.5,
                        height: height * 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        transform: [
                            { translateX: shimmerTranslate },
                            { rotate: '20deg' }
                        ],
                    }}
                />

                {/* The "Flash" - White overlay for the neon ignition */}
                <Animated.View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: '#FFFFFF',
                        opacity: flashOpacity,
                    }}
                />

                {/* Text Content - RENDERED LAST TO BE ON TOP */}
                <View style={{ zIndex: 999, elevation: 10 }}>
                    <Text style={[
                        styles.letterText,
                        { fontSize: (width < 30 ? 20 : 24) + (wordLength <= 9 ? 4 : 0) }
                    ]}>
                        {letter}
                    </Text>
                </View>

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
