import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CustomAlert = ({ message, isVisible, buttonText, onButtonPress, cancelButtonText, onCancelButtonPress, onBackdropPress }) => {
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
        <View style={styles.buttonRow}>
          {cancelButtonText && onCancelButtonPress && (
            <TouchableOpacity style={[styles.buttonContainer, { marginRight: 10 }]} onPress={onCancelButtonPress}>
              <LinearGradient
                colors={['#7f8c8d', '#95a5a6']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.buttonText}>{cancelButtonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
          {buttonText && onButtonPress && (
            <TouchableOpacity style={styles.buttonContainer} onPress={onButtonPress}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.button}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              >
                <Text style={styles.buttonText}>{buttonText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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
    fontFamily: 'EagleLake-Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonContainer: {
    flex: 1,
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'EagleLake-Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default CustomAlert;
