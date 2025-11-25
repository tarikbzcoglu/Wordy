import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const LevelCompleteModal = ({
  isVisible,
  level,
  stars = 0,
  stats = {},
  rewards = {},
  isMilestone = false,
  onNextLevel,
  onBackToMenu
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const textAnim = React.useRef(new Animated.Value(0)).current;
  const starAnims = React.useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const [randomLevelUpAnim, setRandomLevelUpAnim] = React.useState(require('../assets/images/owl_levelup.json'));

  React.useEffect(() => {
    if (isVisible) {
      // Select random levelup animation when modal opens
      const random = Math.floor(Math.random() * 3) + 1;
      if (random === 1) setRandomLevelUpAnim(require('../assets/images/owl_levelup.json'));
      else if (random === 2) setRandomLevelUpAnim(require('../assets/images/owl_levelup2.json'));
      else setRandomLevelUpAnim(require('../assets/images/owl_levelup3.json'));

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

      // Star animations (sequential)
      const starAnimations = starAnims.slice(0, stars).map((anim, index) =>
        Animated.sequence([
          Animated.delay(400 + index * 200),
          Animated.spring(anim, {
            toValue: 1,
            friction: 4,
            tension: 100,
            useNativeDriver: true,
          }),
        ])
      );
      Animated.parallel(starAnimations).start();
    } else {
      // Exit animations
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      textAnim.setValue(0);
      starAnims.forEach(anim => anim.setValue(0));
    }
  }, [isVisible, stars, fadeAnim, textAnim]);

  if (!isVisible) {
    return null;
  }

  const { questionsAnswered = 0, totalQuestions = 0, hintsUsed = 0, mistakes = 0 } = stats;
  const { coins = 0 } = rewards;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.modalBox}>
        <LottieView
          source={randomLevelUpAnim}
          autoPlay
          loop={true}
          style={styles.lottieAnimation}
        />
        <Animated.Text style={[styles.titleText, { transform: [{ scale: textAnim }] }]}>
          {isMilestone ? `🎉 Level ${level} Milestone!` : `Level ${level} Completed!`}
        </Animated.Text>

        {/* Star Rating */}
        {stars > 0 && (
          <View style={styles.starsContainer}>
            {[1, 2, 3].map((index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.star,
                  {
                    opacity: starAnims[index - 1],
                    transform: [{ scale: starAnims[index - 1] }],
                  },
                ]}
              >
                {index <= stars ? '⭐' : '☆'}
              </Animated.Text>
            ))}
          </View>
        )}

        {/* Performance Stats */}
        {totalQuestions > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Correct:</Text>
              <Text style={styles.statValue}>{questionsAnswered}/{totalQuestions}</Text>
            </View>
            {hintsUsed > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Hints Used:</Text>
                <Text style={styles.statValue}>{hintsUsed}</Text>
              </View>
            )}
            {mistakes > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Mistakes:</Text>
                <Text style={styles.statValue}>{mistakes}</Text>
              </View>
            )}
          </View>
        )}

        {/* Rewards */}
        {coins > 0 && (
          <View style={styles.rewardsContainer}>
            <Text style={styles.coinsText}>💰 +{coins} Coins</Text>
          </View>
        )}

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
    width: '85%',
    maxWidth: 360,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: '#1C3B4F',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#68919E',
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
    width: 100,
    height: 100,
    marginBottom: 0,
  },
  titleText: {
    color: '#FFD700',
    fontSize: 32,
    fontFamily: 'Papyrus',
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  star: {
    fontSize: 45,
    marginHorizontal: 6,
  },
  statsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 18,
    color: '#B0BEC5',
    fontFamily: 'Papyrus',
  },
  statValue: {
    fontSize: 18,
    color: '#E1E2E1',
    fontFamily: 'Papyrus',
  },
  rewardsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  coinsText: {
    fontSize: 24,
    color: '#FFD700',
    fontFamily: 'Papyrus',
  },
  button: {
    backgroundColor: '#4A7E8E',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuButton: {
    backgroundColor: '#676D69',
  },
  buttonText: {
    color: '#E1E2E1',
    fontSize: 20,
    fontFamily: 'Papyrus',
  },
});

export default LevelCompleteModal;