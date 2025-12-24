import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { decode } from 'html-entities';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BannerAdSize, GAMBannerAd, RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import AchievementToast from '../components/AchievementToast';
import CustomAlert from '../components/CustomAlert';
import GameHeader from '../components/GameHeader';
import GameOverModal from '../components/GameOverModal';
import Keyboard from '../components/Keyboard';
import LevelCompleteModal from '../components/LevelCompleteModal';
import SettingsModal from '../components/SettingsModal';
import TutorialModal from '../components/TutorialModal';
import { useSound } from '../hooks/useSound';
import questionsData from '../questions_db.json';
import { checkAchievements, updatePlayerStats } from '../utils/achievementUtils';
import { submitScore } from '../utils/leaderboardUtils';
import { calculateStarRating, getQuestionCount, isMilestone } from '../utils/levelUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const adUnitId = __DEV__ ? TestIds.REWARDED : (Platform.OS === 'ios'
  ? 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx'
  : 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx');


const bannerAdUnitId = __DEV__ ? TestIds.BANNER : (Platform.OS === 'ios'
  ? 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx'
  : 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx');

const ENDLESS_TUTORIAL_STEPS = [
  {
    title: 'Endless Mode',
    description: 'Survive as long as you can! Questions get harder as you go.',
    animation: require('../assets/images/rocket.json'),
  },
  {
    title: 'Watch Your Hearts ❤️',
    description: 'You have 5 hearts. Mistakes cost hearts!',
    animation: require('../assets/images/gameover.json'),
  },
  {
    title: 'High Scores',
    description: 'Beat your best score and climb the leaderboard. Good luck!',
    animation: require('../assets/images/milestone.json'),
  },
];

import AnimatedLetterCell from '../components/AnimatedLetterCell';

const GameScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [level, setLevel] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [correctlyAnswered, setCorrectlyAnswered] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [alertInfo, setAlertInfo] = useState({ isVisible: false, message: '', buttonText: null, onButtonPress: null });
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [hintReminder, setHintReminder] = useState({ isVisible: false, message: '' });
  const [highlightHintButton, setHighlightHintButton] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [levelStats, setLevelStats] = useState({
    questionsAnswered: 0,
    totalQuestions: 0,
    hintsUsed: 0,
    mistakes: 0,
    startTime: null,
  });
  const [starRating, setStarRating] = useState(0);

  const isEndlessMode = category === 'Mixed Categories';
  const [mistakesRemaining, setMistakesRemaining] = useState(5);
  const [endlessScore, setEndlessScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [achievementToast, setAchievementToast] = useState({
    isVisible: false,
    achievement: null,
  });

  const hintReminderAnim = useRef(new Animated.Value(0)).current;
  const scoreScaleAnim = useRef(new Animated.Value(1)).current;
  const confettiAnims = useRef([...Array(20)].map(() => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(1),
  }))).current;

  // Shake animation for incorrect answers - use state to update with questions
  const [shakeAnims, setShakeAnims] = useState([]);

  // Fade overlay for modal
  const modalOverlayAnim = useRef(new Animated.Value(0)).current;

  // Initialize shake animations when questions change
  useEffect(() => {
    setShakeAnims(questions.map(() => new Animated.Value(0)));
  }, [questions.length]);

  const activeQuestionRef = useRef(null);
  const isProcessingAttempt = useRef(false);
  const isHintProcessing = useRef(false);
  const [isEndlessTutorialVisible, setIsEndlessTutorialVisible] = useState(false);

  const adRef = useRef(null);
  const adRewardType = useRef('hint'); // 'hint' or 'heart'
  const [adLoaded, setAdLoaded] = useState(false);

  // Refs for level and category to use in effects without triggering them
  const levelRef = useRef(level);
  const categoryRef = useRef(category);

  useEffect(() => {
    levelRef.current = level;
    categoryRef.current = category;
  }, [level, category]);

  useEffect(() => {
    if (endlessScore > 0) {
      Animated.sequence([
        Animated.timing(scoreScaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scoreScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [endlessScore]);

  const playCorrectSound = useSound(require('../assets/sounds/correct.mp3'));
  const playWrongSound = useSound(require('../assets/sounds/wrong.mp3'));
  const playLevelUpSound = useSound(require('../assets/sounds/levelup.mp3'));
  const playTimeUpSound = useSound(require('../assets/sounds/timeup.mp3'));
  const playAchievementSound = useSound(require('../assets/sounds/achievement.mp3'));
  const playTapSound = useSound(require('../assets/sounds/screentap.mp3'));

  const handleAchievementCheck = async (delay = 0, temporaryStats = null) => {
    const newAchievements = await checkAchievements(temporaryStats);
    if (newAchievements && newAchievements.length > 0) {
      setTimeout(() => {
        playAchievementSound();
        setAchievementToast({
          isVisible: true,
          achievement: newAchievements[0],
        });
      }, delay);
    }
  };



  const getLevelStorageKey = (cat) => `level_${cat.replace(/ & /g, '_')}`;
  const getFirstTimeHintKey = (cat) => `first_time_hint_${cat.replace(/ & /g, '_')}`;

  // Load endless mode questions (mixed from all categories)
  const loadEndlessQuestions = useCallback(() => {
    // Get all questions except from Karışık category itself and limit length <= 11
    let allQuestions = questionsData.filter(q =>
      q.category !== 'Mixed Categories' &&
      decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').length <= 11
    );

    // Filter out already used questions
    let unusedQuestions = allQuestions.filter(q => !endlessUsedQuestions.has(q.question));

    // If we ran out of unique questions, reset history and start over
    if (unusedQuestions.length < 5) {
      console.log('Unique questions exhausted, resetting history!');
      setEndlessUsedQuestions(new Set());
      unusedQuestions = allQuestions; // Reset pool
    }

    // Group questions by answer length to ensure UI consistency
    const questionsByLength = {};
    unusedQuestions.forEach(q => {
      const len = decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().length;
      if (!questionsByLength[len]) {
        questionsByLength[len] = [];
      }
      questionsByLength[len].push(q);
    });

    const MIN_QUESTIONS = 5;
    const availableLengths = Object.keys(questionsByLength)
      .map(Number)
      .filter(len => questionsByLength[len].length >= MIN_QUESTIONS);

    let targetQuestions = [];
    let targetLength = 0;

    // Strategy 1: Pick a random length with enough questions
    if (availableLengths.length > 0) {
      targetLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];
      targetQuestions = questionsByLength[targetLength];
    }
    // Strategy 2: Fallback to ANY length that has questions
    else {
      const allLengths = Object.keys(questionsByLength).map(Number);
      if (allLengths.length > 0) {
        targetLength = allLengths.sort((a, b) => questionsByLength[b].length - questionsByLength[a].length)[0];
        targetQuestions = questionsByLength[targetLength];
      }
    }

    // Strategy 3: Ultimate Fallback
    if (!targetQuestions || targetQuestions.length === 0) {
      targetQuestions = [...unusedQuestions];
    }

    // Shuffle and select random questions
    const shuffled = [...targetQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, getQuestionCount(level));

    // Mark selected questions as used
    setEndlessUsedQuestions(prev => {
      const newSet = new Set(prev);
      selected.forEach(q => newSet.add(q.question));
      return newSet;
    });

    const decodedQuestions = selected.map(q => ({
      ...q,
      question: decode(q.question),
      text: decode(q.question), // Required for rendering
      correct_answer: decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase(),
    }));

    setQuestions(decodedQuestions);
    setAnswers(decodedQuestions.map(q =>
      Array(q.correct_answer.length).fill({ letter: '', status: '' })
    ));
    setCorrectlyAnswered(Array(decodedQuestions.length).fill(false));
    setActiveQuestionIndex(null);
    setActiveInputIndex(null);

    // Initialize level stats
    setLevelStats({
      questionsAnswered: 0,
      totalQuestions: decodedQuestions.length,
      hintsUsed: 0,
      mistakes: 0,
      startTime: Date.now(),
    });
  }, [level]);


  useEffect(() => {
    const loadSavedLevel = async () => {
      const storageKey = getLevelStorageKey(category);
      try {
        const savedLevel = await AsyncStorage.getItem(storageKey);
        if (savedLevel !== null) {
          setLevel(parseInt(savedLevel, 10));
        } else {
          setLevel(1);
          // Show first-time hint reminder
          const firstTimeHintShown = await AsyncStorage.getItem(getFirstTimeHintKey(category));
          if (!firstTimeHintShown) {
            setHintReminder({ isVisible: true, message: 'Use hints if you get stuck!' });
            setHighlightHintButton(true);
            setTimeout(() => {
              setHintReminder({ isVisible: false, message: '' });
              setHighlightHintButton(false);
            }, 4000);
            await AsyncStorage.setItem(getFirstTimeHintKey(category), 'true');
          }
        }
      } catch (e) {
        console.error('Failed to load level.', e);
        setLevel(1);
      }
    };
    loadSavedLevel();
  }, [category]);

  // Animate hint reminder when it appears
  useEffect(() => {
    if (hintReminder.isVisible) {
      Animated.spring(hintReminderAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(hintReminderAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [hintReminder.isVisible]);



  // Trigger Watch Ad alert when hints reach 0
  useEffect(() => {
    if (hintsLeft === 0) {
      const timer = setTimeout(() => {
        showAlert('Watch a short video to earn a free hint?', 'Watch Ad', showHintRewardAd);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [hintsLeft]);

  const showAlert = (message, buttonText = null, onButtonPress = null) => {
    if (alertInfo.isVisible) return;
    setAlertInfo({ isVisible: true, message, buttonText, onButtonPress });
    if (!buttonText) {
      setTimeout(() => hideAlert(), 2000);
    }
  };
  const hideAlert = () => setAlertInfo({ isVisible: false, message: '', buttonText: null, onButtonPress: null });

  const loadLevel = useCallback((levelToLoad) => {
    if (levelToLoad === 0) return; // Don't load level 0

    // Reset to level 1 if we go past level 50
    if (levelToLoad > 50) {
      showAlert('Game Complete! Restarting from Level 1.');
      setLevel(1);
      AsyncStorage.setItem(getLevelStorageKey(category), '1');
      return;
    }

    const allCategoryQuestions = questionsData.filter(q =>
      q.category === category &&
      decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').length <= 11
    );

    // Group questions by answer length
    const questionsByLength = {};
    allCategoryQuestions.forEach(q => {
      const len = decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().length;
      if (!questionsByLength[len]) {
        questionsByLength[len] = [];
      }
      questionsByLength[len].push(q);
    });

    // Get available lengths sorted, but ONLY those that have enough questions
    // The user wants to skip lengths that don't have enough unique questions to fill a level (min 5)
    const MIN_QUESTIONS_PER_LEVEL = 5;
    let availableLengths = Object.keys(questionsByLength)
      .map(Number)
      .filter(len => questionsByLength[len].length >= MIN_QUESTIONS_PER_LEVEL)
      .sort((a, b) => a - b);

    // Fallback: If NO lengths have enough questions, just use whatever we have (sorted by most questions)
    if (availableLengths.length === 0) {
      availableLengths = Object.keys(questionsByLength)
        .map(Number)
        .sort((a, b) => questionsByLength[b].length - questionsByLength[a].length); // Sort by count desc

      // If still empty (no questions at all), error out
      if (availableLengths.length === 0) {
        console.error('No questions found for category:', category);
        return;
      }
      // Keep only the best one to avoid cycling through tiny groups
      availableLengths = [availableLengths[0]];
    }

    // Progressive difficulty: map level to answer length
    // Progressive difficulty tiers
    const getTierPool = (simLevel, lengths) => {
      const tier1Max = 10;
      const tier2Max = 30;
      const shortLengths = lengths.filter(l => l <= 5);
      const mediumLengths = lengths.filter(l => l >= 6 && l <= 8);
      const longLengths = lengths.filter(l => l >= 9);

      if (simLevel <= tier1Max && shortLengths.length > 0) return shortLengths;
      if (simLevel <= tier2Max && mediumLengths.length > 0) return mediumLengths;
      if (longLengths.length > 0) return longLengths;
      return lengths;
    };

    // HISTORY SIMULATION WITH SMART SKIP
    // We simulate from Level 1 to current level to know exactly which questions were used.
    // If a length is exhausted, we skip to the next available one in the tier.
    const usageCounts = {}; // Key: length, Value: count of questions used

    let finalTargetLength = availableLengths[0];
    let finalStartIndex = 0;

    for (let l = 1; l <= levelToLoad; l++) {
      const pool = getTierPool(l, availableLengths);

      // Default choice (Round Robin)
      let initialIndex = (l - 1) % pool.length;
      let selectedLen = pool[initialIndex];
      let foundFresh = false;

      // Smart Skip: Look for a length in the pool that isn't exhausted
      for (let offset = 0; offset < pool.length; offset++) {
        const tryIndex = (initialIndex + offset) % pool.length;
        const tryLen = pool[tryIndex];
        const totalAvailable = questionsByLength[tryLen].length;
        const usedSoFar = usageCounts[tryLen] || 0;

        // If we have at least 5 fresh questions left, grab it!
        if (usedSoFar + 5 <= totalAvailable) {
          selectedLen = tryLen;
          foundFresh = true;
          break;
        }
      }

      // Record state for the requested level
      if (l === levelToLoad) {
        finalTargetLength = selectedLen;
        finalStartIndex = usageCounts[selectedLen] || 0;
      }

      // Update usage for the next iteration
      usageCounts[selectedLen] = (usageCounts[selectedLen] || 0) + 5;
    }

    const targetQuestions = questionsByLength[finalTargetLength];
    const startIndex = finalStartIndex; // Determined by simulation
    const questionCount = getQuestionCount(levelToLoad);

    let selectedQuestions = [];

    // Valid unique questions found by simulation
    if (targetQuestions && startIndex + questionCount <= targetQuestions.length) {
      selectedQuestions = targetQuestions.slice(startIndex, startIndex + questionCount);
    } else {
      // Complete Fallback: If simulation says everything is exhausted (or logic flaw),
      // we must repeat. We shuffle the entire pool of that length and pick randoms.
      // This only happens if user plays SO many levels that ALL lengths in the tier are empty.
      let pool = [...(targetQuestions || [])];
      if (pool.length === 0) {
        // Emergency: No info for this length? potentially bad DB state.
        // Fallback to ANY questions from DB to prevent crash
        pool = allCategoryQuestions.slice(0, 20);
      }

      const shuffled = pool.sort(() => 0.5 - Math.random());

      // Fill strictly to 5 even if we have to loop
      while (selectedQuestions.length < questionCount) {
        if (shuffled.length === 0) break; // formatting protection
        selectedQuestions = [...selectedQuestions, ...shuffled];
      }
      selectedQuestions = selectedQuestions.slice(0, questionCount);
    }

    // Safety check ensuring we never pass empty array
    if (selectedQuestions.length === 0) {
      // Ultimate logic fail protection
      selectedQuestions = allCategoryQuestions.slice(0, 5);
    }

    const decodedQuestions = selectedQuestions.map(q => {
      const decodedCorrectAnswer = decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return { ...q, question: decode(q.question), text: decode(q.question), correct_answer: decodedCorrectAnswer };
    });

    setQuestions(decodedQuestions);
    setAnswers(decodedQuestions.map(q => Array(q.correct_answer.length).fill({ letter: '', status: 'empty' })));
    setCorrectlyAnswered(Array(decodedQuestions.length).fill(false));
    setIsLevelComplete(false);

    // Initialize level stats
    setLevelStats({
      questionsAnswered: 0,
      totalQuestions: decodedQuestions.length,
      hintsUsed: 0,
      mistakes: 0,
      startTime: Date.now(),
    });
    setStarRating(0);
  }, [category]);

  useEffect(() => {
    if (isEndlessMode) {
      loadEndlessQuestions();
    } else {
      loadLevel(level);
    }
  }, [level, loadLevel, isEndlessMode, loadEndlessQuestions]);

  // Auto-select first question for tutorial level to ensure keyboard is shown
  useEffect(() => {
    if (level === 1 && category === 'Planet Earth' && questions.length > 0 && activeQuestionIndex === null) {
      // Slightly delay to ensure layout is ready
      setTimeout(() => {
        setActiveQuestionIndex(0);
        setActiveInputIndex(0);
      }, 500);
    }
  }, [questions, level, category, activeQuestionIndex]);

  // Animate overlay when modal appears
  useEffect(() => {
    if (isLevelComplete) {
      Animated.timing(modalOverlayAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalOverlayAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isLevelComplete]);

  useEffect(() => {
    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: true });
    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => setAdLoaded(true));
    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      if (adRewardType.current === 'heart') {
        setMistakesRemaining(prev => Math.min(prev + 1, 5));
        showAlert('You recovered 1 Heart! ❤️');
      } else {
        showAlert(`You earned ${reward.amount} hint!`);
        setHintsLeft(prev => prev + reward.amount);
      }
    });
    const unsubscribeClosed = rewardedAd.addAdEventListener('closed', () => {
      setAdLoaded(false);
      rewardedAd.load();
    });
    rewardedAd.load();
    adRef.current = rewardedAd;
    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, []);

  const showRewardedAd = async () => {
    hideAlert();
    if (adRef.current && adLoaded) {
      adRef.current.show();
    } else {
      showAlert('Ad not ready yet. Please try again in a moment.');
    }
  };

  const showHintRewardAd = () => {
    adRewardType.current = 'hint';
    showRewardedAd();
  };

  const showHeartRewardAd = () => {
    adRewardType.current = 'heart';
    showRewardedAd();
  };

  const handleEndlessTutorialComplete = async () => {
    setIsEndlessTutorialVisible(false);
    await AsyncStorage.setItem('endless_tutorial_shown', 'true');
  };

  useEffect(() => {
    const checkEndlessTutorial = async () => {
      if (isEndlessMode) {
        const shown = await AsyncStorage.getItem('endless_tutorial_shown');
        if (!shown) {
          setIsEndlessTutorialVisible(true);
        }
      }
    };
    checkEndlessTutorial();
  }, [isEndlessMode]);

  useEffect(() => {
    if (correctlyAnswered.length > 0 && correctlyAnswered.every(Boolean)) {
      playLevelUpSound();

      if (isEndlessMode) {
        // Endless Mode: Auto-load next batch after short delay
        setShowConfetti(true);
        setTimeout(() => {
          loadEndlessQuestions();
          setShowConfetti(false);
        }, 1200);
        return;
      }
      const currentLevel = levelRef.current;
      const currentCategory = categoryRef.current;
      const newLevel = currentLevel + 1;

      // Calculate final stats and star rating
      const finalStats = {
        questionsAnswered: correctlyAnswered.filter(Boolean).length,
        totalQuestions: questions.length,
        hintsUsed: levelStats.hintsUsed,
        mistakes: levelStats.mistakes,
        startTime: levelStats.startTime,
      };
      const stars = calculateStarRating(finalStats);


      setLevelStats(finalStats);
      setStarRating(stars);

      const saveProgress = async () => {
        try {
          const storageKey = getLevelStorageKey(currentCategory);
          await AsyncStorage.setItem(storageKey, newLevel.toString());

          // Save star rating
          const starKey = `stars_${currentCategory}_${currentLevel}`;
          await AsyncStorage.setItem(starKey, stars.toString());
        } catch (e) {
          console.error('Failed to save level.', e);
        }
      };
      saveProgress();

      // Trigger confetti celebration
      setShowConfetti(true);
      confettiAnims.forEach((anim, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = 150 + Math.random() * 100;
        Animated.parallel([
          Animated.timing(anim.x, {
            toValue: Math.cos(angle) * distance,
            duration: 1500 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.y, {
            toValue: Math.sin(angle) * distance - 200,
            duration: 1500 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: Math.random() * 720,
            duration: 1500 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(1000),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });

      setTimeout(async () => {
        // Update player stats and check achievements
        const completionTime = levelStats.startTime ? (Date.now() - levelStats.startTime) / 1000 : 0;
        const stars = calculateStarRating(levelStats.hintsUsed, levelStats.mistakes);

        const updatedStats = await updatePlayerStats({
          levels_completed: 1,
          stars: stars,
          perfect: stars === 3,
          no_hints: levelStats.hintsUsed === 0,
          no_mistakes: levelStats.mistakes === 0,
          fast: completionTime < 30,
          category: category,
        });

        // Submit category score to leaderboard
        try {
          const userId = await AsyncStorage.getItem('user_id') || Math.random().toString(36).substr(2, 9);
          if (!await AsyncStorage.getItem('user_id')) {
            await AsyncStorage.setItem('user_id', userId);
          }
          const username = await AsyncStorage.getItem('username') || 'Player' + userId.substr(0, 4);

          // Submit Total Stars
          if (updatedStats && updatedStats.total_stars) {
            await submitScore(userId, username, updatedStats.total_stars, 'Total Stars');
          }

          // Check if this is a new high score for this category
          const categoryKey = `high_score_${category.replace(/\s+/g, '_')}`;
          const currentHigh = await AsyncStorage.getItem(categoryKey);
          const currentHighScore = currentHigh ? parseInt(currentHigh, 10) : 0;

          if (newLevel > currentHighScore) {
            await AsyncStorage.setItem(categoryKey, newLevel.toString());
            await submitScore(userId, username, newLevel, category);
          }
        } catch (error) {
          console.error('Failed to submit category score:', error);
        }

        // Check for new achievements
        handleAchievementCheck(0);

        setIsLevelComplete(true);
        setShowConfetti(false);
        // Reset confetti
        confettiAnims.forEach(anim => {
          anim.x.setValue(0);
          anim.y.setValue(0);
          anim.rotate.setValue(0);
          anim.opacity.setValue(1);
        });
      }, 2000);
    }
  }, [correctlyAnswered, playLevelUpSound, questions.length]);

  const handleHint = () => {
    if (isHintProcessing.current) return;

    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (hintsLeft <= 0) {
      showAlert('Watch a short video to earn a free hint?', 'Watch Ad', showHintRewardAd);
      return;
    }

    // Lock hint processing
    isHintProcessing.current = true;

    // Unlock after delay to prevent double-tap
    setTimeout(() => {
      isHintProcessing.current = false;
    }, 500);

    const unansweredQuestionIndices = questions.map((_, index) => index).filter(index => !correctlyAnswered[index]);
    if (unansweredQuestionIndices.length === 0) {
      showAlert('All questions are answered!');
      return;
    }
    const randomQuestionIndex = unansweredQuestionIndices[Math.floor(Math.random() * unansweredQuestionIndices.length)];
    const randomAnswer = answers[randomQuestionIndex];
    const correctAnswer = questions[randomQuestionIndex].correct_answer;
    const unrevealedEmptyCellIndices = randomAnswer.map((cell, index) => ({ cell, index })).filter(item => item.cell.letter === '' && item.cell.status !== 'revealed').map(item => item.index);
    if (unrevealedEmptyCellIndices.length === 0) {
      showAlert('No more hints available for this question.');
      return;
    }
    const randomHintIndex = unrevealedEmptyCellIndices[Math.floor(Math.random() * unrevealedEmptyCellIndices.length)];
    const newAnswers = [...answers];
    newAnswers[randomQuestionIndex][randomHintIndex] = { letter: correctAnswer[randomHintIndex], status: 'hint' };
    setAnswers(newAnswers);
    setHintsLeft(prevHints => prevHints - 1);

    // Track hint usage
    setLevelStats(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
    }));
    if (newAnswers[randomQuestionIndex].every(cell => cell.letter !== '')) {
      checkAnswer(randomQuestionIndex);
    }
  };

  const checkAnswer = async (questionIndex) => {
    if (correctlyAnswered[questionIndex]) return;
    const userAnswer = answers[questionIndex].map(cell => cell.letter).join('');
    const correctAnswer = questions[questionIndex].correct_answer;

    if (userAnswer === correctAnswer) {
      playCorrectSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (isEndlessMode) {
        const newScore = endlessScore + 10;
        setEndlessScore(newScore);
        // Instant achievement check with current score
        handleAchievementCheck(0, { high_score_endless: newScore });
      }
      let newCorrectlyAnswered = [...correctlyAnswered];
      let newAnswers = JSON.parse(JSON.stringify(answers));
      let queue = [questionIndex];
      let processedInCascade = new Set();
      while (queue.length > 0) {
        const currentIdx = queue.shift();
        if (processedInCascade.has(currentIdx)) continue;
        processedInCascade.add(currentIdx);
        newCorrectlyAnswered[currentIdx] = true;
        const answeredWord = questions[currentIdx].correct_answer;
        questions.forEach((q, qIdx) => {
          if (!newCorrectlyAnswered[qIdx]) {
            const otherAnswer = q.correct_answer;
            let wasChanged = false;
            for (let i = 0; i < answeredWord.length; i++) {
              const revealedLetter = answeredWord[i];
              for (let j = 0; j < otherAnswer.length; j++) {
                if (otherAnswer[j] === revealedLetter && newAnswers[qIdx][j].letter === '') {
                  newAnswers[qIdx][j] = { letter: revealedLetter, status: 'revealed' };
                  wasChanged = true;
                }
              }
            }
            if (wasChanged) {
              const isComplete = newAnswers[qIdx].every(cell => cell.letter !== '');
              const completedAnswer = newAnswers[qIdx].map(c => c.letter).join('');
              if (isComplete && completedAnswer === otherAnswer) {
                queue.push(qIdx);
              }
            }
          }
        });
      }
      setCorrectlyAnswered(newCorrectlyAnswered);
      setAnswers(newAnswers);
      isProcessingAttempt.current = false;

      // Smart Focus: Auto-advance to the next incomplete word
      // Logic: Start searching from (questionIndex + 1), wrap around.
      let nextQuestionIdx = -1;
      for (let offset = 1; offset < questions.length; offset++) {
        const idx = (questionIndex + offset) % questions.length;
        if (!newCorrectlyAnswered[idx]) {
          nextQuestionIdx = idx;
          break;
        }
      }

      if (nextQuestionIdx !== -1) {
        // Find first empty/inputtable cell in this new word
        const nextWordAnswers = newAnswers[nextQuestionIdx];
        let nextEmptyInputIdx = nextWordAnswers.findIndex(cell => cell.status !== 'revealed' && cell.status !== 'hint');

        if (nextEmptyInputIdx !== -1) {
          setActiveQuestionIndex(nextQuestionIdx);
          setActiveInputIndex(nextEmptyInputIdx);
        } else {
          // Should not happen if word is not correct, but just in case
          setActiveQuestionIndex(null);
          setActiveInputIndex(null);
        }
      } else {
        // Level Completed (all answered)
        setActiveQuestionIndex(null);
        setActiveInputIndex(null);
      }
    } else if (userAnswer.length === correctAnswer.length) {
      playWrongSound();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      if (isEndlessMode) {
        const newMistakes = mistakesRemaining - 1;
        setMistakesRemaining(newMistakes);

        // Show warning when hearts drop to 1
        if (newMistakes === 1) {
          showAlert('💔 Last heart! Watch an ad to recover hearts.', 'Watch Ad', showHeartRewardAd);
        }

        if (newMistakes === 0) {
          const currentHighScore = await AsyncStorage.getItem('high_score_endless');
          const highScore = currentHighScore ? parseInt(currentHighScore, 10) : 0;
          const isNewHigh = endlessScore > highScore;
          if (isNewHigh) {
            await AsyncStorage.setItem('high_score_endless', endlessScore.toString());
            setIsNewHighScore(true);
          }
          // Save stats before game over
          await updatePlayerStats({
            category: 'karışık',
            level: endlessScore,
          });

          await handleAchievementCheck();

          // Submit Score to Global Leaderboard
          try {
            const userId = await AsyncStorage.getItem('user_id') || Math.random().toString(36).substr(2, 9);
            if (!await AsyncStorage.getItem('user_id')) {
              await AsyncStorage.setItem('user_id', userId);
            }
            const username = await AsyncStorage.getItem('username') || 'Player' + userId.substr(0, 4);
            await submitScore(userId, username, endlessScore, 'Mixed Categories');
          } catch (error) {
            console.error('Failed to submit score to leaderboard:', error);
          }

          // Removed playTimeUpSound() - no sound on game over
          setIsGameOver(true);
          return;
        }
      } else {
        // Track mistake for non-endless mode
        setLevelStats(prev => ({
          ...prev,
          mistakes: prev.mistakes + 1,
        }));
      }

      // Trigger shake animation - subtle and controlled
      if (shakeAnims[questionIndex]) {
        // Reset to 0 first
        shakeAnims[questionIndex].setValue(0);

        Animated.sequence([
          Animated.timing(shakeAnims[questionIndex], {
            toValue: 5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnims[questionIndex], {
            toValue: -5,
            duration: 50,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnims[questionIndex], {
            toValue: 2,
            duration: 40,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnims[questionIndex], {
            toValue: 0,
            duration: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }

      setAnswers(currentAnswers => {
        const newAnswers = JSON.parse(JSON.stringify(currentAnswers));
        newAnswers[questionIndex] = newAnswers[questionIndex].map(cell => {
          if (cell.status === 'input') return { ...cell, status: 'incorrect' };
          return cell;
        });
        return newAnswers;
      });
      setTimeout(() => {
        let firstEmptyIndex = -1;
        setAnswers(currentAnswers => {
          const newAnswers = JSON.parse(JSON.stringify(currentAnswers));
          newAnswers[questionIndex] = newAnswers[questionIndex].map((cell, index) => {
            if (cell.status !== 'hint' && cell.status !== 'revealed') {
              if (firstEmptyIndex === -1) {
                firstEmptyIndex = index;
              }
              return { letter: '', status: 'empty' };
            }
            return cell;
          });
          return newAnswers;
        });

        if (firstEmptyIndex === -1) {
          firstEmptyIndex = 0;
        }
        setActiveQuestionIndex(questionIndex);
        setActiveInputIndex(firstEmptyIndex);
        // Show hint reminder after wrong answer
        setHintReminder({ isVisible: true, message: 'Stuck? Try using a hint!' });
        setHighlightHintButton(true);
        setTimeout(() => {
          setHintReminder({ isVisible: false, message: '' });
          setHighlightHintButton(false);
        }, 3000);
        isProcessingAttempt.current = false;
      }, 1000);
    }
  };

  const handleAnswerBoxPress = (questionIndex, inputIndex) => {
    if (isProcessingAttempt.current || correctlyAnswered[questionIndex] || (answers[questionIndex] && (answers[questionIndex][inputIndex].status === 'revealed' || answers[questionIndex][inputIndex].status === 'hint'))) return;
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveQuestionIndex(questionIndex);
    setActiveInputIndex(inputIndex);
  };

  const handleKeyPress = (key) => {
    if (isProcessingAttempt.current || activeQuestionIndex === null || activeInputIndex === null || correctlyAnswered[activeQuestionIndex] || (answers[activeQuestionIndex][activeInputIndex] && (answers[activeQuestionIndex][activeInputIndex].status === 'revealed' || answers[activeQuestionIndex][activeInputIndex].status === 'hint'))) return;
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newAnswers = [...answers];
    newAnswers[activeQuestionIndex][activeInputIndex] = { letter: key, status: 'input' };
    setAnswers(newAnswers);
    const currentQuestion = questions[activeQuestionIndex];
    if (newAnswers[activeQuestionIndex].every(cell => cell.letter !== '')) {
      isProcessingAttempt.current = true;
      checkAnswer(activeQuestionIndex);
      // Removed setActiveQuestionIndex(null) to allow checkAnswer to handle smart focus transition
    } else {
      let nextInputIndex = activeInputIndex + 1;
      // Scan forward
      while (nextInputIndex < currentQuestion.correct_answer.length && (newAnswers[activeQuestionIndex][nextInputIndex].status === 'revealed' || newAnswers[activeQuestionIndex][nextInputIndex].status === 'hint')) {
        nextInputIndex++;
      }

      if (nextInputIndex < currentQuestion.correct_answer.length) {
        setActiveInputIndex(nextInputIndex);
      } else {
        // Smart Focus: If reached end, wrap around to start to find any skipped empty cells
        let wrappedIndex = 0;
        let foundEmpty = false;
        while (wrappedIndex < activeInputIndex) {
          const cell = newAnswers[activeQuestionIndex][wrappedIndex];
          if (cell.status !== 'revealed' && cell.status !== 'hint' && cell.letter === '') { // Focus only if empty
            setActiveInputIndex(wrappedIndex);
            foundEmpty = true;
            break;
          }
          wrappedIndex++;
        }

        if (!foundEmpty) {
          setActiveQuestionIndex(null);
          setActiveInputIndex(null);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (isProcessingAttempt.current || activeQuestionIndex === null || activeInputIndex === null || correctlyAnswered[activeQuestionIndex] || (answers[activeQuestionIndex][activeInputIndex] && (answers[activeQuestionIndex][activeInputIndex].status === 'revealed' || answers[activeQuestionIndex][activeInputIndex].status === 'hint'))) return;
    playTapSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAnswers = [...answers];
    newAnswers[activeQuestionIndex][activeInputIndex] = { letter: '', status: 'empty' };
    setAnswers(newAnswers);
    let prevInputIndex = activeInputIndex - 1;
    while (prevInputIndex >= 0 && (newAnswers[activeQuestionIndex][prevInputIndex].status === 'revealed' || newAnswers[activeQuestionIndex][prevInputIndex].status === 'hint')) {
      prevInputIndex--;
    }
    if (prevInputIndex >= 0) {
      setActiveInputIndex(prevInputIndex);
    }
    // If prevInputIndex is less than 0, do nothing, keeping the focus on the first cell.
  };

  const handleEnter = () => {
    if (activeQuestionIndex === null || correctlyAnswered[activeQuestionIndex]) return;
    if (answers[activeQuestionIndex].every(cell => cell.letter !== '')) {
      checkAnswer(activeQuestionIndex);
    }
  };

  const handleNextLevel = () => {
    playTapSound();
    // Enhanced haptic feedback - heavier for milestones
    if (isMilestone(level)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsLevelComplete(false);
    setLevel(prevLevel => prevLevel + 1);
  };

  const handleBackToMenu = () => {
    setIsLevelComplete(false);
    setIsGameOver(false);
    navigation.goBack();
  };

  const [endlessUsedQuestions, setEndlessUsedQuestions] = useState(new Set());

  const handlePlayAgain = () => {
    // Reset processing flag to allow cell clicks
    isProcessingAttempt.current = false;

    setEndlessScore(0);
    setMistakesRemaining(5);
    setIsGameOver(false);
    setIsNewHighScore(false);
    setQuestions([]); // Clear current questions
    setAnswers([]); // Clear answers
    setCorrectlyAnswered([]); // Clear correctly answered
    setActiveQuestionIndex(null); // Reset active question
    setActiveInputIndex(null); // Reset active input
    setHintsLeft(3); // Reset hints
    setEndlessUsedQuestions(new Set()); // Reset used questions history

    // Reset stats
    setLevelStats({
      questionsAnswered: 0,
      totalQuestions: 0,
      hintsUsed: 0,
      mistakes: 0,
      startTime: Date.now(),
    });

    // Slight delay to allow modal to close before loading new questions
    setTimeout(() => {
      loadEndlessQuestions();
    }, 300);
  };

  const questionColumnWidth = SCREEN_WIDTH * 0.3;
  const answerColumnWidth = SCREEN_WIDTH * 0.7 - 4;
  const cellMargin = 1;

  // Owl animation for header
  const [headerOwlAnim, setHeaderOwlAnim] = useState(1);

  const getHeaderOwlSource = () => {
    // 6 animations: idle 1-4, sleep 1-2
    if (headerOwlAnim === 1) return require('../assets/images/owl_idle.json');
    if (headerOwlAnim === 2) return require('../assets/images/owl_idle2.json');
    if (headerOwlAnim === 3) return require('../assets/images/owl_idle3.json');
    if (headerOwlAnim === 4) return require('../assets/images/owl_idle4.json');
    if (headerOwlAnim === 5) return require('../assets/images/owl_sleep.json');
    return require('../assets/images/owl_sleep2.json');
  };

  // Change header owl animation every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setHeaderOwlAnim(Math.floor(Math.random() * 6) + 1); // Random 1-6
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <View style={styles.container}>
        <Image
          source={require('../assets/images/background3.jpeg')}
          style={[StyleSheet.absoluteFillObject, { zIndex: -1 }]}
          contentFit="cover"
          transition={500}
        />
        <View style={{ flex: 1 }}>
          <View style={styles.container}>
            {/* Banner Ad - Very Top */}
            <View style={styles.bannerAdContainer}>
              <GAMBannerAd
                unitId={bannerAdUnitId}
                sizes={[BannerAdSize.ANCHORED_ADAPTIVE_BANNER]}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
              />
            </View>

            <GameHeader
              navigation={navigation}
              playTapSound={playTapSound}
              isEndlessMode={isEndlessMode}
              endlessScore={endlessScore}
              scoreScaleAnim={scoreScaleAnim}
              mistakesRemaining={mistakesRemaining}
              showHeartRewardAd={showHeartRewardAd}
              category={category}
              level={level}
              correctlyAnswered={correctlyAnswered.filter(Boolean).length}
              totalQuestions={questions.length}
              hintsLeft={hintsLeft}
              onHint={handleHint}
              isHintHighlighted={highlightHintButton}
              onSettings={() => setSettingsModalVisible(true)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1 }}
              keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
            >
              <ScrollView
                contentContainerStyle={styles.gameBoard}
                scrollEnabled={false}
              >
                {questions.map((question, questionIndex) => {
                  const currentAnswerLength = question.correct_answer.length;
                  const dynamicCellSize = (answerColumnWidth - (currentAnswerLength * cellMargin * 2)) / currentAnswerLength;
                  return (
                    <Animated.View
                      key={questionIndex}
                      style={[
                        styles.questionAnswerRow,
                        shakeAnims[questionIndex] && {
                          transform: [{
                            translateX: shakeAnims[questionIndex]
                          }]
                        }
                      ]}
                    >
                      <View style={[styles.questionRow, { width: questionColumnWidth }]}>
                        <Text
                          style={styles.questionText}
                          android_hyphenationFrequency="normal"
                        >
                          {question.text}
                        </Text>
                      </View>
                      <View style={[styles.answerBoxesContainer, { width: answerColumnWidth }]}>
                        {answers[questionIndex] && answers[questionIndex].map((cell, inputIndex) => (
                          <AnimatedLetterCell
                            key={`${question.text}-${inputIndex}`} // CRITICAL FIX: Unique key forces remount on new question/level
                            letter={cell.letter}
                            status={cell.status}
                            width={dynamicCellSize}
                            height={60}
                            isSelected={activeQuestionIndex === questionIndex && activeInputIndex === inputIndex}
                            isCorrect={correctlyAnswered[questionIndex]}
                            onPress={() => handleAnswerBoxPress(questionIndex, inputIndex)}
                            disabled={correctlyAnswered[questionIndex]}
                            wordLength={answers[questionIndex].length}
                            // Pass styles for customization
                            style={styles.letterCell}
                            correctStyle={styles.correctAnswerCell}
                            incorrectStyle={styles.incorrectAnswerCell}
                            hintStyle={styles.hintLetterCell}
                            selectedStyle={styles.selectedCell}
                          />
                        ))}
                      </View>
                    </Animated.View>
                  );
                })}
              </ScrollView>
            </KeyboardAvoidingView>

            {/* Modal fade overlay */}
            {isLevelComplete && (
              <Animated.View
                style={[
                  styles.modalOverlay,
                  {
                    opacity: modalOverlayAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3]
                    })
                  }
                ]}
              />
            )}

            <Keyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              screenWidth={SCREEN_WIDTH}
            />

            <CustomAlert
              message={alertInfo.message}
              isVisible={alertInfo.isVisible}
              buttonText={alertInfo.buttonText}
              onButtonPress={alertInfo.onButtonPress}
              onBackdropPress={hideAlert}
            />
            <LevelCompleteModal
              isVisible={isLevelComplete}
              level={level}
              stars={starRating}
              stats={levelStats}
              isMilestone={isMilestone(level)}
              onNextLevel={handleNextLevel}
              onBackToMenu={handleBackToMenu}
            />
            <GameOverModal
              isVisible={isGameOver}
              score={endlessScore}
              isNewHighScore={isNewHighScore}
              onPlayAgain={handlePlayAgain}
              onBackToMenu={handleBackToMenu}
            />
            {hintReminder.isVisible && (
              <Animated.View
                style={[
                  styles.hintReminderContainer,
                  {
                    opacity: hintReminderAnim,
                    transform: [{
                      translateY: hintReminderAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0]
                      })
                    }]
                  }
                ]}
              >
                <Text style={styles.hintReminderText}>💡 {hintReminder.message}</Text>
              </Animated.View>
            )}
            <SettingsModal
              isVisible={isSettingsModalVisible}
              onClose={() => setSettingsModalVisible(false)}
            />

            <TutorialModal
              isVisible={isEndlessTutorialVisible}
              onComplete={handleEndlessTutorialComplete}
              steps={ENDLESS_TUTORIAL_STEPS}
            />

            {/* Confetti Celebration */}
            {showConfetti && (
              <View style={styles.confettiContainer}>
                {confettiAnims.map((anim, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.confetti,
                      {
                        backgroundColor: ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FF6347'][i % 5],
                        transform: [
                          { translateX: anim.x },
                          { translateY: anim.y },
                          {
                            rotate: anim.rotate.interpolate({
                              inputRange: [0, 720],
                              outputRange: ['0deg', '720deg']
                            })
                          }
                        ],
                        opacity: anim.opacity,
                      }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
      <AchievementToast
        achievement={achievementToast.achievement}
        isVisible={achievementToast.isVisible}
        onHide={() => setAchievementToast({ isVisible: false, achievement: null })}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18425cff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 2,
    paddingTop: 0,
    backgroundColor: '#18425cff',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  backButtonModern: {
    width: 42,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  backButtonInner: {
    width: 42,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonTextModern: {
    color: '#E1E2E1',
    fontSize: 36,
    fontFamily: 'EagleLake-Regular',
    marginTop: -14,
  },
  settingsButtonModern: {
    width: 42,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  settingsButtonInner: {
    width: 42,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    gap: 4,
  },
  hamburgerLine: {
    width: 20,
    height: 3,
    backgroundColor: '#E1E2E1',
    borderRadius: 1.5,
  },
  hintButtonContainer: {
    alignItems: 'center',
    marginRight: 25,
  },
  hintButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    overflow: 'hidden',
  },
  hintButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  hintAnimation: {
    width: 40,
    height: 40,
  },
  hintAnimationLarge: {
    width: 55,
    height: 55,
  },
  hintButtonNoBg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintButtonGradientNoBg: {
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  hintButtonText: {
    color: '#E1E2E1',
    fontSize: 12,
    fontFamily: 'EagleLake-Regular',
    marginTop: -5,
  },
  hintButtonTextBelow: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
    marginTop: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerButtonText: {
    color: '#E1E2E1',
    fontSize: 20,
    fontFamily: 'EagleLake-Regular',
  },
  planetInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endlessHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  mistakeCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heartIcon: {
    fontSize: 24,
  },
  scoreDisplay: {
    backgroundColor: 'rgba(74, 126, 142, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
  },

  planetName: {
    color: '#E1E2E1',
    fontSize: 20,
    fontFamily: 'EagleLake-Regular',
    marginRight: 40,
  },
  headerOwlAnimation: {
    width: 50,
    height: 50,
    marginBottom: 0,
    marginRight: 40,
  },
  levelText: {
    color: '#e0cb0bff',
    fontSize: 11,
    fontFamily: 'EagleLake-Regular',
    marginRight: 5,
    marginLeft: 0,

  },
  scoreText: {
    color: '#FFD700',
    fontSize: 22,
    fontFamily: 'EagleLake-Regular',
    // fontWeight removed to fix font rendering
    marginBottom: 4,
    marginRight: 35,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  heartsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 35,
    gap: 4,
  },
  heartIcon: {
    fontSize: 16,
  },
  adButton: {
    marginLeft: 6,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#66BB6A',
  },
  adButtonText: {
    color: '#FFF',
    fontSize: 11,
    fontFamily: 'EagleLake-Regular',
  },
  menu: {
    position: 'absolute',
    top: 80,
    right: 10,
    backgroundColor: '#1C3B4F',
    borderRadius: 5,
    padding: 10,
    zIndex: 1001,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#E1E2E1',
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
  },
  gameBoard: {
    paddingLeft: 0,
    paddingRight: 4,
    paddingVertical: 4,
    paddingTop: 1,
  },
  questionAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  questionRow: {
    backgroundColor: '#1e5577ff',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    minHeight: 90,
    marginRight: 0,
    marginTop: 2,
  },
  questionText: {
    color: '#E1E2E1',
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'EagleLake-Regular',
  },
  answerBoxesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  letterCell: {
    backgroundColor: '#FAF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1, // Biraz daha aralık bırakmak bu stilde iyi durur

    // Kenarlıkları ve 3D efekti
    borderRadius: 6, // Biraz daha köşeli
    borderWidth: 1,
    borderColor: '#E6DABF',     // Üst ve yanlar için açık ton
    borderBottomWidth: 4,       // Alt tarafı kalınlaştırarak taş hissi ver
    borderBottomColor: '#D4C5A5', // Alt taraf için daha koyu ton (Gölge gibi)

    // Hafif bir derinlik gölgesi
    shadowColor: '#8D7D65',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
    backgroundColor: '#26b3daff',
    borderColor: '#66BB6A',
    borderBottomColor: '#66BB6A',
    borderBottomWidth: 4,
    borderTopWidth: 4,
    borderRadius: 8,
    borderTopColor: '#66BB6A',
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
    borderColor: '#AED581',
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
  keyboardContainer: {
    // No specific styles needed here now
  },
  hintReminderContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(25, 92, 139, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.6)',
    zIndex: 3000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  hintReminderText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'EagleLake-Regular',
    textAlign: 'center',
  },
  confettiContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 1000,
  },
  bannerAdContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#1C3B4F',
    paddingVertical: 0,
    borderBottomWidth: 0,
    borderBottomColor: '#4A7E8E',
  },
});

export default GameScreen;