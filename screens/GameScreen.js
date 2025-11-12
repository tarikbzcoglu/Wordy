import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { RewardedAd, RewardedAdEventType, TestIds } from 'react-native-google-mobile-ads';
import questionsData from '../questions_db.json';
import { decode } from 'html-entities';
import Keyboard from '../components/Keyboard';
import { useSound } from '../hooks/useSound';
import CustomAlert from '../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// IMPORTANT: This is a test ID. Replace with your own AdMob Unit ID for production.
const adUnitId = __DEV__ ? TestIds.REWARDED : (Platform.OS === 'ios' 
  ? 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx' // Replace with your real iOS ad unit ID
  : 'ca-app-pub-xxxxxxxxxx/xxxxxxxxxx'); // Replace with your real Android ad unit ID

const GameScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [correctlyAnswered, setCorrectlyAnswered] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [alertInfo, setAlertInfo] = useState({ isVisible: false, message: '', buttonText: null, onButtonPress: null });

  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  // Sound effects
  const playCorrectSound = useSound(require('../assets/sounds/correct.mp3'));
  const playWrongSound = useSound(require('../assets/sounds/wrong.mp3'));
  const playLevelUpSound = useSound(require('../assets/sounds/levelup.mp3'));
  const playTapSound = useSound(require('../assets/sounds/screentap.mp3'));

  // Alert handler
  const showAlert = (message, buttonText = null, onButtonPress = null) => {
    if (alertInfo.isVisible) return;
    setAlertInfo({ isVisible: true, message, buttonText, onButtonPress });
    if (!buttonText) {
      setTimeout(() => hideAlert(), 2000);
    }
  };
  const hideAlert = () => setAlertInfo({ isVisible: false, message: '', buttonText: null, onButtonPress: null });

  // AdMob Rewarded Ad Logic
  useEffect(() => {
    const rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setAdLoaded(true);
    });
    const unsubscribeEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
      showAlert(`You earned ${reward.amount} hint!`);
      setHintsLeft(prev => prev + reward.amount);
    });
    const unsubscribeClosed = rewardedAd.addAdEventListener('closed', () => {
      setAdLoaded(false);
      rewardedAd.load(); // Pre-load next ad
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

  // Effect to check for level completion
  useEffect(() => {
    if (questions.length > 0 && correctlyAnswered.every(Boolean)) {
      playLevelUpSound();
    }
  }, [correctlyAnswered, questions.length, playLevelUpSound]);

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

  useEffect(() => {
    const filteredQuestions = questionsData.filter(q => q.category === category);
    const decodedQuestions = filteredQuestions.map(q => {
      const decodedCorrectAnswer = decode(q.answer).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return { ...q, question: decode(q.question), text: decode(q.question), correct_answer: decodedCorrectAnswer };
    });
    
    const questionLengths = {};
    decodedQuestions.forEach(q => {
      const len = q.correct_answer.length;
      if (!questionLengths[len]) questionLengths[len] = [];
      questionLengths[len].push(q);
    });

    let selectedQuestions = [];
    const availableLengths = Object.keys(questionLengths).filter(len => questionLengths[len].length >= 5);
    if (availableLengths.length > 0) {
      const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];
      selectedQuestions = questionLengths[randomLength].slice(0, 5);
    } else {
      selectedQuestions = decodedQuestions.slice(0, 5);
    }

    setQuestions(selectedQuestions);
    setAnswers(selectedQuestions.map(q => Array(q.correct_answer.length).fill({ letter: '', status: 'empty' })));
    setCorrectlyAnswered(Array(selectedQuestions.length).fill(false));
  }, [category]);

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
        setAnswers(currentAnswers => {
            const resetAnswers = JSON.parse(JSON.stringify(currentAnswers));
            resetAnswers[questionIndex] = resetAnswers[questionIndex].map(cell => {
              if (cell.status === 'incorrect') return { letter: '', status: 'empty' };
              return cell;
            });
            return resetAnswers;
        });
        setActiveQuestionIndex(null);
        setActiveInputIndex(null);
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
    } else {
      setActiveQuestionIndex(null);
      setActiveInputIndex(null);
    }
  };

  const handleEnter = () => {
    if (activeQuestionIndex === null || correctlyAnswered[activeQuestionIndex]) return;
    if (answers[activeQuestionIndex].every(cell => cell.letter !== '')) {
      checkAnswer(activeQuestionIndex);
    }
  };

    const questionColumnWidth = SCREEN_WIDTH * 0.3;
    const answerColumnWidth = SCREEN_WIDTH * 0.7 - 16;
    const cellMargin = 1;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => { playTapSound(); navigation.goBack(); }}>
            <Text style={styles.headerButtonText}>◄</Text>
          </TouchableOpacity>
          <View style={styles.planetInfo}>
            <Text style={styles.planetName}>Wordy</Text>
            <Text style={styles.levelText}>{category}</Text>
          </View>
          <TouchableOpacity style={[styles.headerButton, styles.hintButton]} onPress={handleHint}>
            <Text style={styles.headerButtonText}>💡</Text>
            <Text style={styles.hintButtonText}>Hint: {hintsLeft}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => { playTapSound(); setShowMenu(!showMenu); }}>
            <Text style={styles.headerButtonText}>☰</Text>
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { playTapSound(); showAlert('Settings not implemented yet'); }}>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => { playTapSound(); navigation.popToTop(); }}>
              <Text style={styles.menuItemText}>Quit</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={styles.gameBoard}>
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
                      <TouchableOpacity
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
                      </TouchableOpacity>
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
        />
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    paddingTop: 30, // Safe area for iOS
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hintButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10, // Move slightly to the left
  },
  hintButtonText: {
    color: '#d9d0c1',
    fontSize: 12,
    fontFamily: 'Papyrus',
    marginTop: 2,
  },
  headerButtonText: {
    color: '#d9d0c1',
    fontSize: 20,
    fontFamily: 'Papyrus',
  },
  planetInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetName: {
    color: '#d9d0c1',
    fontSize: 24,
    fontFamily: 'Papyrus',
  },
  levelText: {
    color: '#a69c88',
    fontSize: 14,
    fontFamily: 'Papyrus',
  },
  menu: {
    position: 'absolute',
    top: 80, // Adjust this value to position the menu correctly
    right: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 5,
    padding: 10,
    zIndex: 1001,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#d9d0c1',
    fontSize: 16,
    fontFamily: 'Papyrus',
  },
  gameBoard: {
    padding: 8,
    paddingTop: 12,
  },
  questionAnswerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  questionRow: {
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 100,
    marginRight: 8,
  },
  questionText: {
    color: '#d9d0c1',
    fontSize: 14,
    lineHeight: 18,
    fontFamily: 'Papyrus',
  },
  answerBoxesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  letterCell: {
    backgroundColor: '#d9d0c1',
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
    color: '#333333',
    fontFamily: 'Papyrus',
  },
  keyboardContainer: {
    // No specific styles needed here now
  },
});

export default GameScreen;
