
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Animated, ImageBackground } from 'react-native';
import questionsData from '../questions_db.json';
import { useSound } from '../hooks/useSound';

const image = require('../assets/images/Gemini_Generated_Image_tk5huxtk5huxtk5h.png');

export default function HomeScreen({ navigation }) {
  const [showCategories, setShowCategories] = useState(false);
  const word = 'Wordy'.split('');
  const animatedValues = useRef(word.map(() => new Animated.Value(0))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const playTapSound = useSound(require('../assets/sounds/screentap.mp3'));

  useEffect(() => {
    const staggerAnimation = Animated.stagger(100, 
      animatedValues.map(value => 
        Animated.timing(value, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        })
      )
    );

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    staggerAnimation.start(() => {
      floatAnimation.start();
    });

    return () => {
      staggerAnimation.stop();
      floatAnimation.stop();
    };
  }, []);

  const handlePlay = () => {
    playTapSound();
    setShowCategories(true);
  };

  const handleSettings = () => {
    playTapSound();
    Alert.alert('Settings', 'Settings screen is not implemented yet.');
  };

  const handleExit = () => {
    playTapSound();
    Alert.alert('Exit', 'Are you sure you want to exit?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => {} }, // RNExitApp.exitApp() could be used here
    ]);
  };

  const handleCategoryPress = (category) => {
    playTapSound();
    navigation.navigate('Game', { category });
  };

  const handleBackPress = () => {
    playTapSound();
    setShowCategories(false);
  };

  const renderCategories = () => (
    <View style={styles.categoryMenuContainer}>
      <Text style={styles.subtitle}>Select a Category</Text>
      <ScrollView style={styles.scrollView}>
        {[...new Set(questionsData.map(q => q.category))].map(category => (
          <TouchableOpacity
            key={category}
            style={styles.button}
            onPress={() => handleCategoryPress(category)}
          >
            <Text style={styles.buttonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMainMenu = () => (
    <View style={styles.menuContainer}>
      <View style={styles.titleContainer}>
        {word.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.title,
              {
                opacity: animatedValues[index],
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
      <View style={styles.menu}>
        <TouchableOpacity style={styles.button} onPress={handlePlay}>
          <Text style={styles.buttonText}>Play</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSettings}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleExit}>
          <Text style={styles.buttonText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ImageBackground source={image} style={styles.backgroundImage}>
      <View style={styles.overlay} />
      {showCategories ? renderCategories() : renderMainMenu()}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for readability
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContainer: {
    flex: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure content is above overlay
  },
  categoryMenuContainer: {
    flex: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 1, // Ensure content is above overlay
    paddingVertical: 20, // Add some vertical padding to the container
  },
  titleContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 72,
    color: '#d9d0c1',
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    fontFamily: 'Papyrus',
  },
  subtitle: {
    fontSize: 32,
    color: '#d9d0c1',
    fontFamily: 'Papyrus',
  },
  menu: {
    width: '100%',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#333333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 15, // Reduced margin between buttons
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#d9d0c1',
    fontSize: 18,
    fontFamily: 'Papyrus',
  },
  scrollView: {
    width: '100%',
    flex: 1, // Allow scrollview to take available space
  },
  backButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#d9d0c1',
    fontSize: 18,
    fontFamily: 'Papyrus',
  },
});
