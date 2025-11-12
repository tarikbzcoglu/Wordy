import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Pressable } from 'react-native';

const CustomAlert = ({ message, isVisible, buttonText, onButtonPress, onBackdropPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  return (
    <Animated.View
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents={isVisible ? 'auto' : 'none'} // Control touchability
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onBackdropPress} />
      <View style={styles.alertBox}>
        <Text style={styles.messageText}>{message}</Text>
        {buttonText && onButtonPress && (
          <TouchableOpacity style={styles.button} onPress={onButtonPress}>
            <Text style={styles.buttonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    zIndex: 1000, // Make sure it's on top
  },
  alertBox: {
    width: '80%',
    maxWidth: 300,
    padding: 25,
    backgroundColor: '#1a1a1a', // Dark background matching the theme
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  messageText: {
    color: '#d9d0c1', // Light text matching the theme
    fontSize: 18,
    fontFamily: 'Papyrus',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#4CAF50', // A green color for the button
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Papyrus',
  },
});

export default CustomAlert;
