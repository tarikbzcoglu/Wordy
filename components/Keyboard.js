import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const KEY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

export default function Keyboard({ onKeyPress, onBackspace, onEnter, screenWidth }) {
  const keyMargin = 4;
  const keyboardPaddingHorizontal = 10; // Padding for the entire keyboard container

  // Calculate key width for the longest row (10 keys in QWERTY top row)
  const availableWidthForKeys = screenWidth - (2 * keyboardPaddingHorizontal) - (10 * 2 * keyMargin);
  const keyWidth = availableWidthForKeys / 10;

  // Calculate wide key width for ENTER and BACKSPACE
  const remainingWidthForWideKeys = screenWidth - (2 * keyboardPaddingHorizontal) - (2 * 2 * keyMargin);
  const wideKeyWidth = (remainingWidthForWideKeys / 2) - 10; // Subtracting a bit more for visual spacing

  const styles = StyleSheet.create({
    keyboardContainer: {
      justifyContent: 'center',
      paddingVertical: 5,
      backgroundColor: '#212121',
    },
    key: {
      width: keyWidth,
      height: 40,
      margin: keyMargin,
      backgroundColor: '#d9d0c1',
      alignItems: 'center',
      justifyContent: 'center',
      borderTopLeftRadius: 0,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    },
    keyText: {
      fontSize: 18,
      color: '#333333',
      fontWeight: 'bold',
    },
    keyRow: {
      flexDirection: 'row',
      marginBottom: 5,
      justifyContent: 'center',
      paddingHorizontal: keyboardPaddingHorizontal, // Add horizontal padding to rows
    },
    wideKey: {
      width: wideKeyWidth,
    },
    keyShadow: {
      backgroundColor: '#a69c88',
      width: keyWidth,
      height: 40,
      margin: keyMargin,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 4,
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
      paddingBottom: 2, // Creates the 3D effect
    },
  });

  return (
    <View style={styles.keyboardContainer}>
      {KEY_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.keyRow}>
          {row.map(key => (
            <TouchableOpacity
              key={key}
              onPress={() => onKeyPress(key)}
              style={styles.keyShadow}
            >
              <View style={styles.key}>
                <Text style={styles.keyText}>{key}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <View style={styles.keyRow}>
        <TouchableOpacity
          onPress={onEnter}
          style={[styles.keyShadow, {width: wideKeyWidth}]}
        >
          <View style={[styles.key, styles.wideKey]}>
            <Text style={styles.keyText}>ENTER</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBackspace}
          style={[styles.keyShadow, {width: wideKeyWidth}]}
        >
          <View style={[styles.key, styles.wideKey]}>
            <Text style={styles.keyText}>⌫</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}