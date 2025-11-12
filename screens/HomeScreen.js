
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Animated, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';
import questionsData from '../questions_db.json';
import { useSound } from '../hooks/useSound';

const PULSING_CIRCLE_ANIMATION = {
  "v": "5.7.4",
  "fr": 30,
  "ip": 0,
  "op": 60,
  "w": 100,
  "h": 100,
  "nm": "Pulsing Circle",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ind": 1,
      "ty": 4,
      "nm": "Circle",
      "sr": 1,
      "ks": {
        "o": {
          "a": 0,
          "k": 100
        },
        "r": {
          "a": 0,
          "k": 0
        },
        "p": {
          "a": 0,
          "k": [50, 50, 0]
        },
        "a": {
          "a": 0,
          "k": [50, 50, 0]
        },
        "s": {
          "a": 1,
          "k": [
            {
              "i": { "x": 0.67, "y": 0.67 },
              "o": { "x": 0.33, "y": 0.33 },
              "t": 0,
              "s": [100, 100, 100]
            },
            {
              "i": { "x": 0.67, "y": 0.67 },
              "o": { "x": 0.33, "y": 0.33 },
              "t": 30,
              "s": [80, 80, 100]
            },
            {
              "i": { "x": 0.67, "y": 0.67 },
              "o": { "x": 0.33, "y": 0.33 },
              "t": 60,
              "s": [100, 100, 100]
            }
          ]
        }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "ind": 0,
              "ty": "sh",
              "ix": 1,
              "ks": {
                "a": 0,
                "k": {
                  "c": false,
                  "v": [
                    [25, 0],
                    [0, 25],
                    [-25, 0],
                    [0, -25]
                  ],
                  "i": [
                    [0, 13.8],
                    [13.8, 0],
                    [0, -13.8],
                    [-13.8, 0]
                  ],
                  "o": [
                    [0, -13.8],
                    [-13.8, 0],
                    [0, 13.8],
                    [13.8, 0]
                  ]
                }
              },
              "nm": "Path 1",
              "mn": "ADBE Vector Shape - Group",
              "hd": false
            },
            {
              "ty": "fl",
              "c": {
                "a": 0,
                "k": [0.2, 0.6, 0.8, 1]
              },
              "o": {
                "a": 0,
                "k": 100
              },
              "r": 1,
              "nm": "Fill 1",
              "mn": "ADBE Vector Graphic - Fill",
              "hd": false
            }
          ],
          "nm": "Group 1",
          "mn": "ADBE Vector Group",
          "hd": false
        }
      ],
      "ip": 0,
      "op": 60,
      "st": 0,
      "bm": 0
    }
  ]
};

const image = require('../assets/images/Gemini_Generated_Image_tk5huxtk5huxtk5h.png');
const planetEarthAnimation = require('../assets/images/planetEarth.json');

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
      { text: 'OK', onPress: () => {} },
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
            style={[styles.button, styles.categoryButtonWithAnimation]} // Apply new style for layout
            onPress={() => handleCategoryPress(category)}
          >
            <LottieView
              source={category === 'Planet Earth' ? planetEarthAnimation : PULSING_CIRCLE_ANIMATION}
              autoPlay
              loop
              style={styles.categoryAnimation}
            />
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
      <LottieView
        // IMPORTANT: Replace 'character.json' with the actual name of your animation file.
        source={require('../assets/images/feather.json')}
        style={styles.lottieAnimation}
        autoPlay
        loop
        onError={(error) => console.error('Lottie Error:', error)}
      />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  lottieAnimation: {
    width: 300,
    height: 300,
    position: 'absolute',
    top: 120, // Position it below the title
    alignSelf: 'center',
    zIndex: 1, // Place it above the overlay
  },
  menuContainer: {
    flex: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Place the menu above the Lottie animation
  },
  categoryMenuContainer: {
    flex: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 2, // Place the menu above the Lottie animation
    paddingVertical: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 250, // Push the title down to make space for Lottie
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
    paddingVertical: 10, // Reduced from 15
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 10, // Also reduced from 15
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#d9d0c1',
    fontSize: 16, // Reduced from 18
    fontFamily: 'Papyrus',
  },
  categoryButtonWithAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAnimation: {
    width: 40, // Small size for the animation
    height: 40, // Small size for the animation
    marginRight: 10, // Space between animation and text
    marginLeft: 10, // Add margin to the left to push it inward
  },
  scrollView: {
    width: '100%',
    flex: 1,
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
