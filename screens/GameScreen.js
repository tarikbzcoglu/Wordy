import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import questionsData from '../questions_db.json';
import { decode } from 'html-entities';
import Keyboard from '../components/Keyboard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GameScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]); // User's input for each answer
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [activeInputIndex, setActiveInputIndex] = useState(null);
  const [correctlyAnswered, setCorrectlyAnswered] = useState([]); // Track correctly answered questions
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const filteredQuestions = questionsData.filter(q => q.category === category);

    const decodedQuestions = filteredQuestions.map(q => {
      const decodedQuestionText = decode(q.question);
      const decodedCorrectAnswer = decode(q.answer);
      // Normalize correct answer: remove diacritics and convert to uppercase
      const normalizedCorrectAnswer = decodedCorrectAnswer.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
      return { ...q, question: decodedQuestionText, text: decodedQuestionText, correct_answer: normalizedCorrectAnswer };
    });
    
    // Filter questions to get 6 with the same answer length
    const questionLengths = {};
    decodedQuestions.forEach(q => {
      const len = q.correct_answer.length;
      if (!questionLengths[len]) {
        questionLengths[len] = [];
      }
      questionLengths[len].push(q);
    });

    let selectedQuestions = [];
    const availableLengths = Object.keys(questionLengths).filter(len => questionLengths[len].length >= 6);

    if (availableLengths.length > 0) {
      const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];
      selectedQuestions = questionLengths[randomLength].slice(0, 6);
    } else {
      // Fallback if not enough questions of same length, just take first 6
      selectedQuestions = decodedQuestions.slice(0, 6);
    }

    setQuestions(selectedQuestions);
    // Initialize answers with empty strings for each letter
    setAnswers(selectedQuestions.map(q => Array(q.correct_answer.length).fill({ letter: '', status: 'empty' })));
    setCorrectlyAnswered(Array(selectedQuestions.length).fill(false));
  }, [category]);

  const checkAnswer = (questionIndex) => {
    const userAnswer = answers[questionIndex].map(cell => cell.letter).join('');
    const correctAnswer = questions[questionIndex].correct_answer;

    if (userAnswer === correctAnswer) {
      const newCorrectlyAnswered = [...correctlyAnswered];
      newCorrectlyAnswered[questionIndex] = true;
      setCorrectlyAnswered(newCorrectlyAnswered);
      revealLetters(questionIndex);
    } else if (userAnswer.length === correctAnswer.length) {
      // Visual feedback for incorrect answer
      const newAnswers = [...answers];
      // Temporarily mark as incorrect for styling
      newAnswers[questionIndex] = newAnswers[questionIndex].map(cell => ({ ...cell, status: 'incorrect' }));
      setAnswers(newAnswers);

      setTimeout(() => {
        // Clear the incorrect answer after a short delay, preserving revealed letters
        const resetAnswers = [...answers];
        resetAnswers[questionIndex] = resetAnswers[questionIndex].map(cell => {
          if (cell.status === 'input') {
            return { letter: '', status: 'empty' };
          } else {
            return cell;
          }
        });
        setAnswers(resetAnswers);
        setActiveQuestionIndex(null);
        setActiveInputIndex(null);
      }, 1000); // 1 second delay for visual feedback
    }
  };

  const revealLetters = (answeredQuestionIndex) => {
    const answeredWord = questions[answeredQuestionIndex].correct_answer;
    const newAnswers = [...answers];

    questions.forEach((q, qIndex) => {
      if (qIndex !== answeredQuestionIndex && !correctlyAnswered[qIndex]) {
        const otherAnswer = q.correct_answer;
        for (let i = 0; i < answeredWord.length; i++) {
          const revealedLetter = answeredWord[i];
          for (let j = 0; j < otherAnswer.length; j++) {
            if (otherAnswer[j] === revealedLetter && newAnswers[qIndex][j].letter === '') {
              newAnswers[qIndex][j] = { letter: revealedLetter, status: 'revealed' };
            }
          }
        }
      }
    });
    setAnswers(newAnswers);
  };

  const handleAnswerBoxPress = (questionIndex, inputIndex) => {
    if (correctlyAnswered[questionIndex]) return; // Don't allow editing if already correct
    if (answers[questionIndex][inputIndex].status === 'revealed') return; // Don't allow selecting revealed letters
    setActiveQuestionIndex(questionIndex);
    setActiveInputIndex(inputIndex);
  };

  const handleKeyPress = (key) => {
    if (activeQuestionIndex === null || activeInputIndex === null || correctlyAnswered[activeQuestionIndex]) return;
    if (answers[activeQuestionIndex][activeInputIndex].status === 'revealed') return; // Ignore key press on revealed letter

    const newAnswers = [...answers];
    newAnswers[activeQuestionIndex][activeInputIndex] = { letter: key, status: 'input' };
    setAnswers(newAnswers);

    const currentQuestion = questions[activeQuestionIndex];
    const isAnswerComplete = newAnswers[activeQuestionIndex].every(cell => cell.letter !== '');

    if (isAnswerComplete) {
      checkAnswer(activeQuestionIndex);
      setActiveQuestionIndex(null);
      setActiveInputIndex(null);
    } else {
      // Find the next editable cell
      let nextInputIndex = activeInputIndex + 1;
      while (nextInputIndex < currentQuestion.correct_answer.length && newAnswers[activeQuestionIndex][nextInputIndex].status === 'revealed') {
        nextInputIndex++;
      }
      if (nextInputIndex < currentQuestion.correct_answer.length) {
        setActiveInputIndex(nextInputIndex);
      } else {
        // If no more editable cells, deselect
        setActiveQuestionIndex(null);
        setActiveInputIndex(null);
      }
    }
  };

  const handleBackspace = () => {
    if (activeQuestionIndex === null || activeInputIndex === null || correctlyAnswered[activeQuestionIndex]) return;
    if (answers[activeQuestionIndex][activeInputIndex].status === 'revealed') return; // Ignore backspace on revealed letter

    const newAnswers = [...answers];
    newAnswers[activeQuestionIndex][activeInputIndex] = { letter: '', status: 'empty' };
    setAnswers(newAnswers);

    // Find the previous editable cell
    let prevInputIndex = activeInputIndex - 1;
    while (prevInputIndex >= 0 && newAnswers[activeQuestionIndex][prevInputIndex].status === 'revealed') {
      prevInputIndex--;
    }
    if (prevInputIndex >= 0) {
      setActiveInputIndex(prevInputIndex);
    } else {
      // If no more editable cells, deselect
      setActiveQuestionIndex(null);
      setActiveInputIndex(null);
    }
  };

  const handleEnter = () => {
    if (activeQuestionIndex === null || correctlyAnswered[activeQuestionIndex]) return;

    const currentQuestion = questions[activeQuestionIndex];
    const isAnswerComplete = answers[activeQuestionIndex].every(cell => cell.letter !== '');

    if (isAnswerComplete) {
      checkAnswer(activeQuestionIndex);
    }
  };

    // Layout calculations

    const questionColumnWidth = SCREEN_WIDTH * 0.3; // 30% for questions

    const answerColumnWidth = SCREEN_WIDTH * 0.7 - 16; // 70% for answers minus padding

    const cellMargin = 1; // for the marginHorizontal

  

    return (

      <View style={styles.container}>

        {/* Header */}

        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Text style={styles.headerButtonText}>◄</Text>
          </TouchableOpacity>
          <View style={styles.planetInfo}>
            <Text style={styles.planetName}>Wordy</Text>
            <Text style={styles.levelText}>{category}</Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowMenu(!showMenu)}>
            <Text style={styles.headerButtonText}>☰</Text>
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Settings', 'Settings not implemented yet')}>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.popToTop()}>
              <Text style={styles.menuItemText}>Quit</Text>
            </TouchableOpacity>
          </View>
        )}

  

                {/* Main Content */}

        

                <KeyboardAvoidingView 

        

                  behavior={Platform.OS === "ios" ? "padding" : "height"} 

        

                  style={{ flex: 1 }}

        

                  keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust this value as needed

        

                >

        

                  <View style={styles.gameBoard}>

        

                    {questions.map((question, questionIndex) => {

        

                      const currentAnswerLength = question.correct_answer.length;

        

                      const dynamicCellSize = (answerColumnWidth - (currentAnswerLength * cellMargin * 2)) / currentAnswerLength;

        

          

        

                      return (

        

                        <View key={questionIndex} style={styles.questionAnswerRow}>

        

                          <TouchableOpacity 

        

                            style={[styles.questionRow, { width: questionColumnWidth }]}>
                            <Text style={styles.questionText}>
                              {question.text}
                            </Text>
                          </TouchableOpacity>
                          <View style={[styles.answerBoxesContainer, { width: answerColumnWidth, minHeight: 100 }]}>

        

                            {answers[questionIndex].map((cell, inputIndex) => (

        

                              <TouchableOpacity

        

                                key={inputIndex}

        

                                style={[

        

                                  styles.letterCell,

        

                                  { width: dynamicCellSize, height: 80 }, // Fixed height for better appearance

        

                                  activeQuestionIndex === questionIndex && activeInputIndex === inputIndex && styles.selectedCell,

        

                                  correctlyAnswered[questionIndex] && styles.correctAnswerCell,

        

                                                                    cell.status === 'incorrect' && styles.incorrectAnswerCell

        

                                                                  ]}

        

                                onPress={() => handleAnswerBoxPress(questionIndex, inputIndex)}

        

                                disabled={correctlyAnswered[questionIndex]} // Disable if already correct

        

                              >

        

                                <Text style={styles.letterText}>{cell.letter}</Text>

        

                              </TouchableOpacity>

        

                            ))}

        

                          </View>

        

                        </View>

        

                      );

        

                    })}

        

                  </View>

        

                </KeyboardAvoidingView>

  

        <View style={styles.keyboardContainer}>

          <Keyboard onKeyPress={handleKeyPress} onBackspace={handleBackspace} onEnter={handleEnter} screenWidth={SCREEN_WIDTH} />

        </View>

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
    paddingVertical: 8,
    paddingTop: 45, // Safe area for iOS
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 1,
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    color: '#d9d0c1',
    fontSize: 16,
    fontFamily: 'Papyrus',
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinText: {
    color: '#d9d0c1',
    fontSize: 14,
    fontFamily: 'Papyrus',
  },
  gameBoard: {
    flexDirection: 'column',
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
    minHeight: 100, // Increased minHeight for more text
    marginRight: 8,
  },
  questionText: {
    color: '#d9d0c1',
    fontSize: 10,
    lineHeight: 13,
    fontFamily: 'Papyrus',
  },
  answerBoxesContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4, // Add padding inside the container
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
  letterText: {
    fontSize: 20,
    color: '#333333',
    fontFamily: 'Papyrus',
  },
  keyboardContainer: {
    width: '100%',
  },
});

export default GameScreen;