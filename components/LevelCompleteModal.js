import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import LottieView from 'lottie-react-native';

const LevelCompleteModal = ({ isVisible, level, onNextLevel, onBackToMenu }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const textAnim = React.useRef(new Animated.Value(0)).current; // Animation for the title

  React.useEffect(() => {
    if (isVisible) {
      // Entrance animations
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
      Animated.spring(textAnim, {
        toValue: 1,
        friction: 4,
        tension: 50,
        useNativeDriver: true,
      }).start();
    } else {
      // Exit animations
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      // Reset text animation value
      textAnim.setValue(0);
    }
  }, [isVisible, fadeAnim, textAnim]);

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.modalBox}>
        <LottieView
          source={require('../assets/images/levelup.json')}
          autoPlay
          loop={true}
          style={styles.lottieAnimation}
        />
        <Animated.Text style={[styles.titleText, { transform: [{ scale: textAnim }] }]}>
          Level {level} Completed!
        </Animated.Text>
        <TouchableOpacity style={styles.button} onPress={onNextLevel}>
          <Text style={styles.buttonText}>Next Level</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.menuButton]} onPress={onBackToMenu}>
          <Text style={styles.buttonText}>Back to Menu</Text>
        </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 2000,
  },
  modalBox: {
    width: '80%',
    maxWidth: 320,
    paddingHorizontal: 30,
    paddingBottom: 30,
    paddingTop: 10, // Reduced top padding
    backgroundColor: '#1C3B4F', // charcoal
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#68919E', // air_force_blue_2
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 5.84,
    elevation: 10,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
    marginBottom: 0, // Added space between animation and title
  },
  titleText: {
    color: '#E1E2E1', // light_gray
    fontSize: 32,
    fontFamily: 'Papyrus',
    marginBottom: 30,
    textShadowColor: 'rgba(225, 226, 225, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  button: {
    backgroundColor: '#4A7E8E', // air_force_blue
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuButton: {
    backgroundColor: '#676D69', // dim_gray
  },
  buttonText: {
    color: '#E1E2E1', // light_gray
    fontSize: 18,
    fontFamily: 'Papyrus',
  },
});

export default LevelCompleteModal;