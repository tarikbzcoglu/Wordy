import { AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as StoreReview from 'expo-store-review';
import LottieView from 'lottie-react-native';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BannerAdSize, GAMBannerAd, TestIds } from 'react-native-google-mobile-ads';
import AchievementsModal from '../components/AchievementsModal';
import CustomAlert from '../components/CustomAlert';

// ... existing imports ...



import LeaderboardModal from '../components/LeaderboardModal';
import SettingsModal from '../components/SettingsModal';
import StatsModal from '../components/StatsModal';
import TutorialModal from '../components/TutorialModal';
import UsernameModal from '../components/UsernameModal';
import { MusicContext } from '../context/MusicContext'; // Import MusicContext
import { useSound } from '../hooks/useSound';
import questionsData from '../questions_db.json';

const bannerAdUnitId = __DEV__ ? TestIds.BANNER : (Platform.OS === 'ios'
  ? 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx'
  : 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx');

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

const image = require('../assets/images/background.jpeg');
const planetEarthAnimation = require('../assets/images/planetEarth.json');
const artAndLiteratureAnimation = require('../assets/images/Art&literature.json');
const foodsAndCultureAnimation = require('../assets/images/foods&culture.json');
const gamesAndTechnologyAnimation = require('../assets/images/games&technology.json');
const generalKnowledgeAnimation = require('../assets/images/generalKnowledge.json');
const historyAndCivilizationAnimation = require('../assets/images/history&civilization.json');
const moviesAndPopCultureAnimation = require('../assets/images/movies&popculture.json');
const scienceAndNatureAnimation = require('../assets/images/science&nature.json');
const travelAndGeographyAnimation = require('../assets/images/travel&geography.json');
const rocketAnimation = require('../assets/images/rocket.json');

const categoryAnimationsMap = {
  'Mixed Categories': rocketAnimation,
  'Planet Earth': planetEarthAnimation,
  'General Knowledge': generalKnowledgeAnimation,
  'Science & Nature': scienceAndNatureAnimation,
  'Food & Culture': foodsAndCultureAnimation,
  'History & Civilization': historyAndCivilizationAnimation,
  'Movies & Pop Culture': moviesAndPopCultureAnimation,
  'Art & Literature': artAndLiteratureAnimation,
  'Games & Technology': gamesAndTechnologyAnimation,
  'Travel & Geography': travelAndGeographyAnimation,
};

const getLevelStorageKey = (cat) => `level_${cat.replace(/ & /g, '_')}`;
const allCategories = ['Mixed Categories', ...[...new Set(questionsData.map(q => q.category))].sort((a, b) => {
  const order = {
    'Planet Earth': 0,
    'General Knowledge': 1,
    'Science & Nature': 2,
    'Food & Culture': 6,
    'History & Civilization': 4,
    'Movies & Pop Culture': 5,
    'Art & Literature': 3,
    'Games & Technology': 7,
    'Travel & Geography': 8,
  };
  const aOrder = order.hasOwnProperty(a) ? order[a] : 1000;
  const bOrder = order.hasOwnProperty(b) ? order[b] : 1000;
  return aOrder - bOrder;
})];

export default function HomeScreen({ navigation }) {
  const [showCategories, setShowCategories] = useState(false);
  const [categoryLevels, setCategoryLevels] = useState({});
  const [endlessHighScore, setEndlessHighScore] = useState(0);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isTutorialVisible, setTutorialVisible] = useState(false);
  const [isAchievementsModalVisible, setAchievementsModalVisible] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ isVisible: false, message: '', buttonText: null, onButtonPress: null, cancelButtonText: null, onCancelButtonPress: null });

  const [isStatsModalVisible, setStatsModalVisible] = useState(false);
  const [isLeaderboardVisible, setLeaderboardVisible] = useState(false);
  const [isUsernameModalVisible, setUsernameModalVisible] = useState(false);
  const { isMusicEnabled, setIsMusicEnabled } = useContext(MusicContext); // Use MusicContext

  const word = 'Wordy'.split('');
  const animatedValues = useRef(word.map(() => new Animated.Value(0))).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const playTapSound = useSound(require('../assets/sounds/screentap.mp3'));
  const playHoot1 = useSound(require('../assets/sounds/hoot1.mp3'));
  const playHoot2 = useSound(require('../assets/sounds/hoot2.mp3'));
  const playHoot3 = useSound(require('../assets/sounds/hoot3.mp3'));
  const playHoot4 = useSound(require('../assets/sounds/hoot4.mp3'));

  // Button animation refs
  const playButtonScale = useRef(new Animated.Value(1)).current;
  const settingsButtonScale = useRef(new Animated.Value(1)).current;
  const exitButtonScale = useRef(new Animated.Value(1)).current;
  const achievementsButtonScale = useRef(new Animated.Value(1)).current;
  const leaderboardButtonScale = useRef(new Animated.Value(1)).current;


  const scrollIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scrollIndicatorAnim, {
          toValue: 10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scrollIndicatorAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scrollIndicatorAnim]);
  // Music playback logic is now in MusicContext, so remove related states and effects
  // const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  // const [soundObject, setSoundObject] = useState(null);
  // const [isMusicEnabled, setIsMusicEnabled] = useState(true);

  // Removed music-related useEffects from here.

  useFocusEffect(
    useCallback(() => {
      const loadCategoryLevels = async () => {
        try {
          const levels = {};
          for (const category of allCategories) {
            const key = getLevelStorageKey(category);
            const savedLevel = await AsyncStorage.getItem(key);
            levels[category] = savedLevel ? parseInt(savedLevel, 10) : 1;
          }
          setCategoryLevels(levels);

          const savedHighScore = await AsyncStorage.getItem('high_score_endless');
          setEndlessHighScore(savedHighScore ? parseInt(savedHighScore, 10) : 0);

          // Check if username exists
          const savedUsername = await AsyncStorage.getItem('username');
          if (!savedUsername) {
            setUsernameModalVisible(true);
          }

          // Check if this is the first time opening the app
          const tutorialShown = await AsyncStorage.getItem('tutorial_shown');
          if (!tutorialShown) {
            setTutorialVisible(true);
          }
        } catch (e) {
          console.error('Failed to load category levels.', e);
        }
      };
      loadCategoryLevels();
    }, [])
  );

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
    setSettingsModalVisible(true);
  };

  const handleExit = () => {
    playTapSound();
    setAlertInfo({
      isVisible: true,
      message: 'Are you sure you want to exit Wordy?',
      buttonText: 'Yes',
      onButtonPress: () => {
        setAlertInfo({ ...alertInfo, isVisible: false });
        BackHandler.exitApp();
      },
      cancelButtonText: 'No',
      onCancelButtonPress: () => setAlertInfo({ ...alertInfo, isVisible: false }),
    });
  };

  const handleCategoryPress = (category) => {
    playTapSound();
    navigation.navigate('Game', { category });
  };

  const handleBackPress = () => {
    playTapSound();
    setShowCategories(false);
  };

  const handleTutorialComplete = async () => {
    try {
      await AsyncStorage.setItem('tutorial_shown', 'true');
      setTutorialVisible(false);
    } catch (e) {
      console.error('Failed to save tutorial status.', e);
    }
  };

  const handleUsernameSubmit = async (username) => {
    try {
      await AsyncStorage.setItem('username', username);
      // Generate and save user ID if not exists
      const userId = await AsyncStorage.getItem('user_id') || Math.random().toString(36).substr(2, 9);
      if (!await AsyncStorage.getItem('user_id')) {
        await AsyncStorage.setItem('user_id', userId);
      }
      setUsernameModalVisible(false);
    } catch (e) {
      console.error('Failed to save username.', e);
    }
  };

  const handleRateApp = async () => {
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
      } else {
        // Fallback: Could open app store link directly
        console.log('Store review not available on this device');
      }
    } catch (error) {
      console.error('Error requesting store review:', error);
    }
  };

  const renderCategories = () => (
    <View style={styles.categoryMenuContainer}>
      <Text style={styles.subtitle}>Select a Category</Text>
      <ScrollView style={styles.scrollView} scrollEnabled={true} indicatorStyle="white">
        {allCategories.map(category => {
          const isEndlessMode = category === 'Mixed Categories';
          const currentLevel = isEndlessMode ? 0 : (categoryLevels[category] || 1);
          const progress = isEndlessMode ? 0 : (currentLevel / 50) * 100;

          return (
            <Pressable
              key={category}
              style={({ pressed }) => [
                styles.categoryCard,
                isEndlessMode && styles.endlessModeCard,
                { transform: [{ scale: pressed ? 0.97 : 1 }] }
              ]}
              onPress={() => handleCategoryPress(category)}
            >
              <LinearGradient
                colors={isEndlessMode ? ['#b63711ff', '#b61111ff', '#b61111ff'] : ['#0e75b0ff', '#1e5577ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.categoryGradient}
              >
                {isEndlessMode && (
                  <View style={styles.endlessBadge}>
                    <Text style={styles.endlessBadgeText}>ENDLESS</Text>
                  </View>
                )}
                <LottieView
                  source={categoryAnimationsMap[category] || PULSING_CIRCLE_ANIMATION}
                  autoPlay
                  loop
                  style={styles.categoryAnimation}
                />
                <View style={styles.categoryButtonTextContainer}>
                  <Text style={styles.categoryButtonText}>{category}</Text>
                  {!isEndlessMode && <Text style={styles.levelText}>Level {currentLevel}/50</Text>}
                  {isEndlessMode && <Text style={styles.endlessSubtext}>High Score: {endlessHighScore}</Text>}
                  {!isEndlessMode && (
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${progress}%` }]} />
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Pressable>
          );
        })}

      </ScrollView>
      <Animated.View style={{ transform: [{ translateY: scrollIndicatorAnim }], marginBottom: 10 }}>
        <AntDesign name="down" size={24} color="#FFF" style={{ opacity: 0.8 }} />
      </Animated.View>
      <Pressable style={({ pressed }) => [
        styles.backButton,
        { backgroundColor: pressed ? 'rgba(28, 59, 79, 0.8)' : '#0e75b0ff' }
      ]} onPress={handleBackPress}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
    </View>
  );

  const renderMainMenu = () => (
    <View style={styles.menuContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Wordy</Text>
      </View>
      <View style={styles.menu}>
        <Animated.View style={{ transform: [{ scale: playButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={handlePlay}
            onPressIn={() => {
              Animated.spring(playButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(playButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#1e5577ff', '#0e75b0ff', '#1e5577ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <LottieView
                source={require('../assets/images/play.json')}
                autoPlay
                loop
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { fontFamily: 'EagleLake-Regular' }]}>Play</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: achievementsButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={() => {
              playTapSound();
              setAchievementsModalVisible(true);
            }}
            onPressIn={() => {
              Animated.spring(achievementsButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(achievementsButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#1e5577ff', '#0e75b0ff', '#1e5577ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientButton, { paddingVertical: 0 }]}
            >
              <LottieView
                source={require('../assets/images/Achievements.json')}
                autoPlay
                loop
                style={{ width: 75, height: 75 }}
              />
              <Text style={styles.buttonText}>Achievements</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: leaderboardButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={() => {
              playTapSound();
              setLeaderboardVisible(true);
            }}
            onPressIn={() => {
              Animated.spring(leaderboardButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(leaderboardButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#1e5577ff', '#0e75b0ff', '#1e5577ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <LottieView
                source={require('../assets/images/leaderboard.json')}
                autoPlay
                loop
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Leaderboard</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>



        <Animated.View style={{ transform: [{ scale: settingsButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={handleSettings}
            onPressIn={() => {
              Animated.spring(settingsButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(settingsButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#1e5577ff', '#0e75b0ff', '#1e5577ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <LottieView
                source={require('../assets/images/settings.json')}
                autoPlay
                loop
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Settings</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: exitButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={handleExit}
            onPressIn={() => {
              Animated.spring(exitButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(exitButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#1e5577ff', '#0e75b0ff', '#1e5577ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.gradientButton, { paddingVertical: 10, paddingHorizontal: 25 }]}
            >
              <LottieView
                source={require('../assets/images/exit.json')}
                autoPlay
                loop
                style={[styles.buttonIcon, { width: 45, height: 45, marginLeft: -6, marginRight: -6 }]}
              />
              <Text style={styles.buttonText}>Exit</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>


      </View>
    </View>
  );

  // Owl animation state
  const [owlState, setOwlState] = useState('hi'); // 'hi', 'idle'
  const [currentIdleAnimation, setCurrentIdleAnimation] = useState(1);
  const owlAnimationRef = useRef(null);
  const owlScaleAnim = useRef(new Animated.Value(1)).current;

  const getOwlSource = () => {
    switch (owlState) {
      case 'hi': return require('../assets/images/owl_hi.json');
      case 'idle':
        // Randomly select one of the 6 animations (4 idle + 2 sleep)
        if (currentIdleAnimation === 1) return require('../assets/images/owl_idle.json');
        if (currentIdleAnimation === 2) return require('../assets/images/owl_idle2.json');
        if (currentIdleAnimation === 3) return require('../assets/images/owl_idle3.json');
        if (currentIdleAnimation === 4) return require('../assets/images/owl_idle4.json');
        if (currentIdleAnimation === 5) return require('../assets/images/owl_sleep.json');
        return require('../assets/images/owl_sleep2.json');
      default: return require('../assets/images/owl_idle.json');
    }
  };

  const handleOwlAnimationFinish = () => {
    if (owlState === 'hi') {
      // After hi animation, switch to idle and pick a random idle animation
      setOwlState('idle');
      setCurrentIdleAnimation(Math.floor(Math.random() * 6) + 1); // Random 1-6
    }
  };

  const handleOwlPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Play random hoot sound
    const hootSounds = [playHoot1, playHoot2, playHoot3, playHoot4];
    const randomHoot = hootSounds[Math.floor(Math.random() * hootSounds.length)];
    randomHoot();

    // More dramatic scale animation: grow then shrink with bounce
    Animated.sequence([
      Animated.spring(owlScaleAnim, {
        toValue: 1.3,
        friction: 3,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(owlScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Change to a different random idle animation
    const newAnim = Math.floor(Math.random() * 6) + 1; // Random 1-6
    setCurrentIdleAnimation(newAnim);
  };

  // Change idle animation every 8 seconds
  useEffect(() => {
    if (owlState === 'idle') {
      const interval = setInterval(() => {
        setCurrentIdleAnimation(Math.floor(Math.random() * 6) + 1); // Random 1-6
      }, 8000); // 8 seconds

      return () => clearInterval(interval);
    }
  }, [owlState]);

  return (
    <View style={styles.backgroundImage}>
      <Image
        source={image}
        style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
        contentFit="cover"
        transition={500}
      />
      <View style={styles.overlay} />

      {/* Banner Ad - Top */}
      <View style={styles.bannerAdContainer}>
        <GAMBannerAd
          unitId={bannerAdUnitId}
          sizes={[BannerAdSize.ANCHORED_ADAPTIVE_BANNER]}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>

      {/* Profile Button */}
      {!showCategories && (
        <Pressable
          style={styles.profileButton}
          onPress={() => {
            playTapSound();
            setStatsModalVisible(true);
          }}
        >
          <LinearGradient
            colors={['#2C3E50', '#34495E']}
            style={styles.profileButtonGradient}
          >
            <LottieView
              source={require('../assets/images/stats.json')}
              autoPlay
              loop
              style={styles.statsAnimation}
            />
          </LinearGradient>
        </Pressable>
      )}

      {/* Rate App Button */}
      {!showCategories && (
        <Pressable
          style={({ pressed }) => [
            styles.rateAppButton,
            { transform: [{ scale: pressed ? 0.9 : 1 }] }
          ]}
          onPress={handleRateApp}
        >
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FF8C00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rateAppButtonGradient}
          >
            <View style={styles.rateAppIconContainer}>
              <Text style={styles.rateAppIcon}>⭐</Text>
            </View>
          </LinearGradient>
          <Text style={styles.rateAppText}>Rate Us!</Text>
        </Pressable>
      )}

      {!showCategories && (
        <Pressable onPress={handleOwlPress} style={styles.owlPressable}>
          <Animated.View style={{ transform: [{ scale: owlScaleAnim }] }}>
            <LottieView
              ref={owlAnimationRef}
              source={getOwlSource()}
              style={styles.lottieAnimation}
              resizeMode="contain"
              autoPlay
              loop={owlState !== 'hi'}
              onAnimationFinish={handleOwlAnimationFinish}
              onError={(error) => console.error('Lottie Error:', error)}
            />
          </Animated.View>
        </Pressable>
      )}

      {showCategories ? renderCategories() : renderMainMenu()}
      <SettingsModal
        isVisible={isSettingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
      />
      <TutorialModal
        isVisible={isTutorialVisible}
        onComplete={handleTutorialComplete}
      />
      <AchievementsModal
        isVisible={isAchievementsModalVisible}
        onClose={() => setAchievementsModalVisible(false)}
      />
      <LeaderboardModal
        isVisible={isLeaderboardVisible}
        onClose={() => setLeaderboardVisible(false)}
      />
      <UsernameModal
        isVisible={isUsernameModalVisible}
        onSubmit={handleUsernameSubmit}
      />

      <StatsModal
        isVisible={isStatsModalVisible}
        onClose={() => setStatsModalVisible(false)}
      />
      <CustomAlert
        message={alertInfo.message}
        isVisible={alertInfo.isVisible}
        buttonText={alertInfo.buttonText}
        onButtonPress={alertInfo.onButtonPress}
        cancelButtonText={alertInfo.cancelButtonText}
        onCancelButtonPress={alertInfo.onCancelButtonPress}
        onBackdropPress={() => setAlertInfo({ ...alertInfo, isVisible: false })}
      />
    </View>
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
    backgroundColor: 'rgba(28, 59, 79, 0.6)',
  },
  profileButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    zIndex: 110,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  profileButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  profileButtonIcon: {
    fontSize: 24,
  },
  statsAnimation: {
    width: 40,
    height: 40,
  },
  rateAppButton: {
    position: 'absolute',
    top: 75,
    left: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  rateAppButtonGradient: {
    width: 55,
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  rateAppIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateAppIcon: {
    fontSize: 28,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rateAppText: {
    color: '#FFD700',
    fontSize: 11,
    fontFamily: 'EagleLake-Regular',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  lottieAnimation: {
    width: 133,
    height: 133,
  },
  owlPressable: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    width: 200,
    height: 200,
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
    justifyContent: 'flex-start',
    zIndex: 2, // Place the menu above the Lottie animation
    paddingTop: 0,
    paddingBottom: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    marginTop: 100, // Adjusted margin
  },
  title: {
    fontSize: 72,
    color: '#E1E2E1', // White color
    marginBottom: 35,
    fontFamily: 'Papyrus',
  },
  subtitle: {
    fontSize: 32,
    color: '#e6ca12ff',
    fontFamily: 'EagleLake-Regular',
    paddingBottom: 1,
    marginTop: 0,
  },
  menu: {
    width: '100%',
    marginTop: 20,
    gap: 15,
  },
  button: {
    borderRadius: 25,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonIcon: {
    width: 45,
    height: 45,
  },
  buttonText: {
    color: '#E1E2E1',
    fontSize: 26,
    fontFamily: 'EagleLake-Regular',
    marginLeft: -5,
  },
  categoryButtonText: {
    color: '#E1E2E1',
    fontSize: 20,
    fontFamily: 'EagleLake-Regular',
  },
  categoryCard: {
    borderRadius: 15,
    marginBottom: 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  endlessModeCard: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  endlessBadge: {
    position: 'absolute',
    top: 22,
    right: 6,
    backgroundColor: '#FF4500',
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRadius: 10,
    zIndex: 10,
  },
  endlessBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'EagleLake-Regular',
  },
  endlessSubtext: {
    color: '#FFD700',
    fontSize: 15,
    fontFamily: 'EagleLake-Regular',
    marginTop: 2,
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  categoryButtonWithAnimation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryAnimation: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  categoryButtonTextContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  levelText: {
    color: '#FFD700',
    fontSize: 13,
    fontFamily: 'EagleLake-Regular',
    marginTop: 3,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  scrollView: {
    width: '100%',
    flex: 1,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 20,
  },
  backButtonText: {
    color: '#dcc40cff',
    fontSize: 20,
    fontFamily: 'EagleLake-Regular',
  },
  bannerAdContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 59, 79, 0.9)',
    paddingVertical: 2,
  },
});