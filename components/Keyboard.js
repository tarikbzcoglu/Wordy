import * as Haptics from 'expo-haptics';
import React, { useCallback, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const keyMargin = 4;
const keyboardPaddingHorizontal = 10;

// Static styles - Retro pixel art style
const styles = StyleSheet.create({
  keyboardContainer: {
    justifyContent: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(28, 59, 79, 0.3)',
  },
  keyText: {
    fontSize: 18,
    color: '#E1E2E1',
    fontWeight: 'bold',
    fontFamily: 'Papyrus',
  },
  keyRow: {
    flexDirection: 'row',
    marginBottom: 5,
    justifyContent: 'center',
    paddingHorizontal: keyboardPaddingHorizontal,
  },
});

// Individual Key Component with animation - Retro 3D style - Memoized
const KeyButton = React.memo(({ letter, onPress, keyStyle, shadowStyle, isWide = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 80,
        bounciness: 0,
      }),
      Animated.spring(translateYAnim, {
        toValue: 2,
        useNativeDriver: true,
        speed: 80,
        bounciness: 0,
      }),
    ]).start();
  }, [scaleAnim, translateYAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 80,
        bounciness: 4,
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 80,
        bounciness: 4,
      }),
    ]).start();
  }, [scaleAnim, translateYAnim]);

  return (
    <Animated.View
      style={[
        shadowStyle,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateYAnim }
          ]
        }
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={letter}
        accessibilityHint={isWide ? `${letter} key` : `Type ${letter}`}
      >
        <View style={keyStyle}>
          <Text style={styles.keyText}>{letter}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
});

export default function Keyboard({ onKeyPress, onBackspace, onEnter, screenWidth }) {
  // Memoize dynamic style calculations
  const dynamicStyles = useMemo(() => {
    const availableWidthForKeys = screenWidth - (2 * keyboardPaddingHorizontal) - (10 * 2 * keyMargin);
    const keyWidth = availableWidthForKeys / 10;
    const remainingWidthForWideKeys = screenWidth - (2 * keyboardPaddingHorizontal) - (2 * 2 * keyMargin);
    const wideKeyWidth = (remainingWidthForWideKeys / 2) - 10;

    return {
      key: {
        width: keyWidth,
        height: 35,
        margin: keyMargin,
        backgroundColor: '#68919E',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      },
      keyShadow: {
        backgroundColor: '#4A7E8E',
        width: keyWidth,
        height: 35,
        margin: keyMargin,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        paddingBottom: 2,
      },
      wideKey: {
        width: wideKeyWidth,
        height: 35,
        margin: keyMargin,
        backgroundColor: '#68919E',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
      },
      wideShadow: {
        backgroundColor: '#4A7E8E',
        width: wideKeyWidth,
        height: 35,
        margin: keyMargin,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 4,
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
        paddingBottom: 2,
      },
    };
  }, [screenWidth]);

  // Memoize callbacks to prevent re-renders
  const handleKeyPress = useCallback((key) => {
    onKeyPress(key);
  }, [onKeyPress]);

  const handleBackspace = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBackspace();
  }, [onBackspace]);

  const handleEnter = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnter();
  }, [onEnter]);

  // Memoize key rows to prevent re-creating on every render
  const keyRows = useMemo(() => KEY_ROWS.map((row, rowIndex) => (
    <View key={rowIndex} style={styles.keyRow}>
      {row.map(key => (
        <KeyButton
          key={key}
          letter={key}
          onPress={() => handleKeyPress(key)}
          keyStyle={dynamicStyles.key}
          shadowStyle={dynamicStyles.keyShadow}
        />
      ))}
    </View>
  )), [dynamicStyles.key, dynamicStyles.keyShadow, handleKeyPress]);

  return (
    <View style={styles.keyboardContainer}>
      {keyRows}
      <View style={styles.keyRow}>
        <KeyButton
          letter="ENTER"
          onPress={handleEnter}
          keyStyle={dynamicStyles.wideKey}
          shadowStyle={dynamicStyles.wideShadow}
          isWide={true}
        />
        <KeyButton
          letter="⌫"
          onPress={handleBackspace}
          keyStyle={dynamicStyles.wideKey}
          shadowStyle={dynamicStyles.wideShadow}
          isWide={true}
        />
      </View>
    </View>
  );
}