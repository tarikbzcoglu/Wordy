import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions, Platform, KeyboardAvoidingView, ScrollView, ImageBackground } from 'react-native';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import questionsData from '../questions_db.json';
import { decode } from 'html-entities';
import Keyboard from '../components/Keyboard';
import { useSound } from '../hooks/useSound';
import CustomAlert from '../components/CustomAlert';
import LevelCompleteModal from '../components/LevelCompleteModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const adUnitId = __DEV__ ? TestIds.REWARDED : (Platform.OS === 'ios' 
  ? 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx'
  : 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx');

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

  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  const playCorrectSound = useSound(require('../assets/sounds/correct.mp3'));
  const playWrongSound = useSound(require('../assets/sounds/wrong.mp3'));
  const playLevelUpSound = useSound(require('../assets/sounds/levelup.mp3'));
  const playTapSound = useSound(require('../assets/sounds/screentap.mp3'));

  const getLevelStorageKey = (cat) => `level_${cat.replace(/ & /g, '_')}`;

  useEffect(() => {
    const loadSavedLevel = async () => {
      const storageKey = getLevelStorageKey(category);
      console.log(`Loading level for key: ${storageKey}`);
      try {
        const savedLevel = await AsyncStorage.getItem(storageKey);
        console.log(`Loaded level value: ${savedLevel}`);
        if (savedLevel !== null) {
          setLevel(parseInt(savedLevel, 10));
        } else {
          console.log('No level saved, defaulting to 1.');
          setLevel(1);
        }
      } catch (e) {
        console.error('Failed to load level.', e);
        setLevel(1);
      }
    };
    loadSavedLevel();
  }, [category]);

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
    const allCategoryQuestions = questionsData.filter(q => q.category === category);
    
    const questionGroups = {};
    allCategoryQuestions.forEach(q => {
      const len = decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().length;
      if (!questionGroups[len]) {
        questionGroups[len] = [];
      }
      questionGroups[len].push(q);
    });

    const levelPacks = [];
    const sortedGroupKeys = Object.keys(questionGroups).sort((a, b) => a - b);
    sortedGroupKeys.forEach(key => {
      const group = questionGroups[key];
      if (group.length >= 5) {
        for (let i = 0; i < Math.floor(group.length / 5); i++) {
          levelPacks.push(group.slice(i * 5, (i + 1) * 5));
        }
      }
    });

    const levelIndex = levelToLoad - 1;
    if (levelIndex >= levelPacks.length) {
      showAlert('Category Complete! Restarting from Level 1.');
      setLevel(1);
      AsyncStorage.setItem(getLevelStorageKey(category), '1');
      return;
    }

    const selectedQuestions = levelPacks[levelIndex];
    const decodedQuestions = selectedQuestions.map(q => {
      const decodedCorrectAnswer = decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return { ...q, question: decode(q.question), text: decode(q.question), correct_answer: decodedCorrectAnswer };
    });

    setQuestions(decodedQuestions);
    setAnswers(decodedQuestions.map(q => Array(q.correct_answer.length).fill({ letter: '', status: 'empty' })));
    setCorrectlyAnswered(Array(decodedQuestions.length).fill(false));
    setIsLevelComplete(false);
  }, [category]);

  useEffect(() => {
    loadLevel(level);
  }, [level, loadLevel]);

  useEffect(() => {
    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, { requestNonPersonalizedAdsOnly: true });
    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => setAdLoaded(true));
    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      showAlert(`You earned ${reward.amount} hint!`);
      setHintsLeft(prev => prev + reward.amount);
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

  useEffect(() => {
    if (questions.length > 0 && correctlyAnswered.length > 0 && correctlyAnswered.every(Boolean)) {
      playLevelUpSound();
      const newLevel = level + 1;
      const saveProgress = async () => {
        try {
          const storageKey = getLevelStorageKey(category);
          console.log(`Level ${level} completed! Saving next level ${newLevel} for key: ${storageKey}`);
          await AsyncStorage.setItem(storageKey, newLevel.toString());
        } catch (e) {
          console.error('Failed to save level.', e);
        }
      };
      saveProgress();
      setTimeout(() => setIsLevelComplete(true), 500);
    }
  }, [correctlyAnswered, questions, level, category, playLevelUpSound]);

  const handleHint = () => {
    playTapSound();
    if (hintsLeft <= 0) {
      showAlert('You have no hints left. Watch an ad to get more!', 'Watch Ad', showRewardedAd);
      return;
    }
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
    if (newAnswers[randomQuestionIndex].every(cell => cell.letter !== '')) {
      checkAnswer(randomQuestionIndex);
    }
  };

  const checkAnswer = (questionIndex) => {
    if (correctlyAnswered[questionIndex]) return;
    const userAnswer = answers[questionIndex].map(cell => cell.letter).join('');
    const correctAnswer = questions[questionIndex].correct_answer;

    if (userAnswer === correctAnswer) {
        playCorrectSound();
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
    } else if (userAnswer.length === correctAnswer.length) {
      playWrongSound();
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
      }, 1000);
    }
  };

  const handleAnswerBoxPress = (questionIndex, inputIndex) => {
    if (correctlyAnswered[questionIndex] || (answers[questionIndex] && answers[questionIndex][inputIndex].status === 'revealed')) return;
    setActiveQuestionIndex(questionIndex);
    setActiveInputIndex(inputIndex);
  };

  const handleKeyPress = (key) => {
    if (activeQuestionIndex === null || activeInputIndex === null || correctlyAnswered[activeQuestionIndex] || (answers[activeQuestionIndex][activeInputIndex] && answers[activeQuestionIndex][activeInputIndex].status === 'revealed')) return;
    const newAnswers = [...answers];
    newAnswers[activeQuestionIndex][activeInputIndex] = { letter: key, status: 'input' };
    setAnswers(newAnswers);
    const currentQuestion = questions[activeQuestionIndex];
    if (newAnswers[activeQuestionIndex].every(cell => cell.letter !== '')) {
      checkAnswer(activeQuestionIndex);
      setActiveQuestionIndex(null);
      setActiveInputIndex(null);
    } else {
      let nextInputIndex = activeInputIndex + 1;
      while (nextInputIndex < currentQuestion.correct_answer.length && newAnswers[activeQuestionIndex][nextInputIndex].status === 'revealed') {
        nextInputIndex++;
      }
      if (nextInputIndex < currentQuestion.correct_answer.length) {
        setActiveInputIndex(nextInputIndex);
      } else {
        setActiveQuestionIndex(null);
        setActiveInputIndex(null);
      }
    }
  };

  const handleBackspace = () => {
    if (activeQuestionIndex === null || activeInputIndex === null || correctlyAnswered[activeQuestionIndex] || (answers[activeQuestionIndex][activeInputIndex] && answers[activeQuestionIndex][activeInputIndex].status === 'revealed')) return;
    const newAnswers = [...answers];
    newAnswers[activeQuestionIndex][activeInputIndex] = { letter: '', status: 'empty' };
    setAnswers(newAnswers);
    let prevInputIndex = activeInputIndex - 1;
    while (prevInputIndex >= 0 && newAnswers[activeQuestionIndex][prevInputIndex].status === 'revealed') {
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
    setIsLevelComplete(false);
    setLevel(prevLevel => prevLevel + 1);
  };

  const handleBackToMenu = () => {
    playTapSound();
    navigation.popToTop();
  };

    const questionColumnWidth = SCREEN_WIDTH * 0.3;
    const answerColumnWidth = SCREEN_WIDTH * 0.7 - 1;
    const cellMargin = 1;

    return (
      <ImageBackground source={require('../assets/images/background3.jpeg')} style={{flex: 1}}>
        <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={({ pressed }) => [
              styles.headerButton,
              { backgroundColor: pressed ? 'rgba(28, 59, 79, 0.8)' : '#4A7E8E' }
            ]} onPress={() => { playTapSound(); navigation.goBack(); }}>
            <Text style={styles.headerButtonText}>◄</Text>
          </Pressable>
          <View style={styles.planetInfo}>
            <Text style={styles.planetName}>Wordy</Text>
            <Text style={styles.levelText}>{category} - Level {level}</Text>
          </View>
          <Pressable style={({ pressed }) => [
              styles.headerButton,
              styles.hintButton,
              { backgroundColor: pressed ? 'rgba(28, 59, 79, 0.8)' : '#4A7E8E' }
            ]} onPress={handleHint}>
            <LottieView
              source={require('../assets/images/hint.json')}
              autoPlay
              loop
              style={styles.hintAnimation}
            />
            <Text style={styles.hintButtonText}>Hint: {hintsLeft}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [
              styles.headerButton,
              { backgroundColor: pressed ? 'rgba(28, 59, 79, 0.8)' : '#4A7E8E' }
            ]} onPress={() => { playTapSound(); setShowMenu(!showMenu); }}>
            <Text style={styles.headerButtonText}>☰</Text>
          </Pressable>
        </View>

        {showMenu && (
          <View style={styles.menu}>
            <Pressable style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? 'rgba(28, 59, 79, 0.8)' : 'transparent' }
              ]} onPress={() => { playTapSound(); showAlert('Settings not implemented yet'); }}>
              <Text style={styles.menuItemText}>Settings</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [
                styles.menuItem,
                { backgroundColor: pressed ? 'rgba(28, 59, 79, 0.8)' : 'transparent' }
              ]} onPress={handleBackToMenu}>
              <Text style={styles.menuItemText}>Quit</Text>
            </Pressable>
          </View>
        )}
        
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
                <View key={questionIndex} style={styles.questionAnswerRow}>
                  <View style={[styles.questionRow, { width: questionColumnWidth }]}>
                    <Text style={styles.questionText}>{question.text}</Text>
                  </View>
                  <View style={[styles.answerBoxesContainer, { width: answerColumnWidth }]}>
                    {answers[questionIndex] && answers[questionIndex].map((cell, inputIndex) => (
                      <Pressable
                        key={inputIndex}
                        style={[
                          styles.letterCell,
                          { width: dynamicCellSize, height: 60 },
                          activeQuestionIndex === questionIndex && activeInputIndex === inputIndex && styles.selectedCell,
                          correctlyAnswered[questionIndex] && styles.correctAnswerCell,
                          cell.status === 'incorrect' && styles.incorrectAnswerCell,
                          cell.status === 'hint' && styles.hintLetterCell
                        ]}
                        onPress={() => handleAnswerBoxPress(questionIndex, inputIndex)}
                        disabled={correctlyAnswered[questionIndex]}
                      >
                        <Text style={styles.letterText}>{cell.letter}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </KeyboardAvoidingView>
  
        <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} onEnter={handleEnter} screenWidth={SCREEN_WIDTH} />

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
          onNextLevel={handleNextLevel}
          onBackToMenu={handleBackToMenu}
        />
      </View>
      </ImageBackground>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(28, 59, 79, 0.7)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    paddingTop: 30, // Safe area for iOS
    backgroundColor: '#1C3B4F',
    borderBottomWidth: 1,
    borderBottomColor: '#4A7E8E',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10, // Move slightly to the left
  },
  hintAnimation: {
    width: 40,
    height: 40,
  },
  hintButtonText: {
    color: '#E1E2E1',
    fontSize: 12,
    fontFamily: 'Papyrus',
    marginTop: -5,
  },
  headerButtonText: {
    color: '#E1E2E1',
    fontSize: 20,
    fontFamily: 'Papyrus',
  },
  planetInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetName: {
    color: '#E1E2E1',
    fontSize: 24,
    fontFamily: 'Papyrus',
  },
  levelText: {
    color: '#858882',
    fontSize: 14,
    fontFamily: 'Papyrus',
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
    fontFamily: 'Papyrus',
  },
  gameBoard: {
    paddingLeft: 0,
    paddingRight: 1,
    paddingVertical: 8,
    paddingTop: 12,
  },
  questionAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  questionRow: {
    backgroundColor: '#1C3B4F',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 100,
    marginRight: 0,
  },
  questionText: {
    color: '#E1E2E1',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Papyrus',
  },
  answerBoxesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
  },
  letterCell: {
    backgroundColor: '#E1E2E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 1,
  },
  selectedCell: {
    backgroundColor: '#FFD700',
  },
  correctAnswerCell: {
    backgroundColor: '#4CAF50',
  },
  incorrectAnswerCell: {
    backgroundColor: '#FF6B6B',
  },
  hintLetterCell: {
    backgroundColor: '#ADD8E6',
  },
  letterText: {
    fontSize: 20,
    color: '#1C3B4F',
    fontFamily: 'Papyrus',
  },
  keyboardContainer: {
    // No specific styles needed here now
  },
});

export default GameScreen;