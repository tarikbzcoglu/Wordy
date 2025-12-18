import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const AnimatedLetterCell = ({ letter, status, width, height, isSelected, isCorrect, onPress, disabled }) => {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const shimmerAnim = useRef(new Animated.Value(0)).current;
    const shimmer2Anim = useRef(new Animated.Value(0)).current;
    const bounceAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;
    const rainbowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (letter) {
            // Modern elastic pop-in
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 200,
                useNativeDriver: true,
            }).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [letter]);

    useEffect(() => {
        if (status === 'revealed' || status === 'hint') {
            // Enhanced reveal: smoother shimmer + prominent glow + bounce
            Animated.parallel([
                // Main shimmer sweep (faster and more prominent)
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                // Second shimmer (closer timing for better effect)
                Animated.sequence([
                    Animated.delay(100),
                    Animated.timing(shimmer2Anim, {
                        toValue: 1,
                        duration: 450,
                        useNativeDriver: true,
                    }),
                ]),
                // Rainbow glow pulse (longer and more visible)
                Animated.sequence([
                    Animated.timing(rainbowAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rainbowAnim, {
                        toValue: 0,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ]),
                // Stronger glow pulse
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.3,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]),
                // Smooth bounce
                Animated.sequence([
                    Animated.spring(bounceAnim, {
                        toValue: 1,
                        friction: 4,
                        tension: 180,
                        useNativeDriver: true,
                    }),
                    Animated.spring(bounceAnim, {
                        toValue: 0,
                        friction: 6,
                        tension: 120,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start(() => {
                shimmerAnim.setValue(0);
                shimmer2Anim.setValue(0);
            });
        }
    }, [status]);

    const shimmerTranslate = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 2, width * 2]
    });

    const shimmer2Translate = shimmer2Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [-width * 2, width * 2]
    });

    const bounceScale = bounceAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.2]
    });

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 0.5, 0.6]
    });

    const rainbowOpacity = rainbowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5]
    });

    return (
        <View>
            {/* Rainbow glow layer */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: width + 8,
                    height: height + 8,
                    left: -4,
                    top: -4,
                    borderRadius: 8,
                    backgroundColor: '#FF69B4',
                    opacity: rainbowOpacity,
                }}
            />
            {/* Subtle glow background */}
            <Animated.View
                style={{
                    position: 'absolute',
                    width: width + 6,
                    height: height + 6,
                    left: -3,
                    top: -3,
                    borderRadius: 6,
                    backgroundColor: status === 'hint' ? '#87CEEB' : '#FFD700',
                    opacity: glowOpacity,
                }}
            />
            <Pressable
                style={[
                    styles.letterCell,
                    { width, height, overflow: 'hidden' },
                    isSelected && styles.selectedCell,
                    isCorrect && styles.correctAnswerCell,
                    status === 'incorrect' && styles.incorrectAnswerCell,
                    status === 'hint' && styles.hintLetterCell
                ]}
                onPress={onPress}
                disabled={disabled}
            >
                {/* First shimmer */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: width * 0.6,
                        height: height * 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        transform: [
                            { translateX: shimmerTranslate },
                            { rotate: '25deg' }
                        ],
                    }}
                />
                {/* Second shimmer (trailing) */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        width: width * 0.4,
                        height: height * 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        transform: [
                            { translateX: shimmer2Translate },
                            { rotate: '25deg' }
                        ],
                    }}
                />
                <Animated.View style={{
                    transform: [
                        { scale: Animated.multiply(scaleAnim, bounceScale) }
                    ]
                }}>
                    <Text style={[styles.letterText, { fontSize: width < 30 ? 20 : 24 }]}>{letter}</Text>
                </Animated.View>
            </Pressable>
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
        backgroundColor: '#B3E5FC',
        borderColor: '#87CEEB',
        borderWidth: 2,
        shadowColor: '#87CEEB',
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
