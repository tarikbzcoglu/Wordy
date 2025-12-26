import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

const LevelCompleteModal = ({
  isVisible,
  level,
  stars = 0,
  stats = {},
  onNextLevel,
  onBackToMenu,
  isMilestone
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const textAnim = React.useRef(new Animated.Value(0)).current;
  const starAnims = React.useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Button scale animations
  const nextButtonScale = React.useRef(new Animated.Value(1)).current;
  const menuButtonScale = React.useRef(new Animated.Value(1)).current;

  // Milestone pulse animation
  const milestonePulse = React.useRef(new Animated.Value(1)).current;

  const [randomLevelUpAnim, setRandomLevelUpAnim] = React.useState(require('../assets/images/owl_levelup.json'));

  React.useEffect(() => {
    if (isVisible) {
      // Select random levelup animation when modal opens
      const random = Math.floor(Math.random() * 5) + 1;
      if (random === 1) setRandomLevelUpAnim(require('../assets/images/owl_levelup.json'));
      else if (random === 2) setRandomLevelUpAnim(require('../assets/images/owl_levelup2.json'));
      else if (random === 3) setRandomLevelUpAnim(require('../assets/images/owl_levelup3.json'));
      else if (random === 4) setRandomLevelUpAnim(require('../assets/images/owl_levelup4.json'));
      else setRandomLevelUpAnim(require('../assets/images/owl_levelup5.json'));

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
      nextButtonScale.setValue(1);
      menuButtonScale.setValue(1);
      milestonePulse.setValue(1);
    }
  }, [isVisible, stars, fadeAnim, textAnim]);

  // Milestone pulse effect
  React.useEffect(() => {
    if (isVisible && isMilestone) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(milestonePulse, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(milestonePulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isVisible, isMilestone]);

  // Request Review on Milestones
  React.useEffect(() => {
    if (isVisible && isMilestone) {
      const requestReview = async () => {
        if (await StoreReview.isAvailableAsync()) {
          // Delay to let the user enjoy the animation and feel accomplished
          setTimeout(() => {
            StoreReview.requestReview();
          }, 1500); // 1.5s delay
        }
      };
      requestReview();
    }
  }, [isVisible, isMilestone]);

  if (!isVisible) {
    return null;
  }

  const { questionsAnswered = 0, totalQuestions = 0, hintsUsed = 0, mistakes = 0 } = stats;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.modalBox}>
        <LottieView
          source={randomLevelUpAnim}
          autoPlay
          loop={true}
          style={styles.lottieAnimation}
        />
        <View style={styles.titleContainer}>
          {isMilestone && (
            <Animated.View style={{ transform: [{ scale: milestonePulse }] }}>
              <LottieView
                source={require('../assets/images/milestone.json')}
                autoPlay
                loop={true}
                style={styles.milestoneIcon}
              />
            </Animated.View>
          )}
          <Animated.Text style={[styles.titleText, { transform: [{ scale: textAnim }] }]}>
            {isMilestone ? `Level ${level} Milestone!` : `Level ${level} Completed!`}
          </Animated.Text>
        </View>

        {/* Star Rating */}
        <View style={styles.starsContainer}>
          {[1, 2, 3].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.starWrapper,
                index <= stars && {
                  transform: [{ scale: starAnims[index - 1] }],
                },
              ]}
            >
              {/* Render empty star background for all positions */}
              <AntDesign name="star" size={50} color="rgba(255, 215, 0, 0.2)" style={styles.starEmpty} />

              {/* Overlay filled star if earned */}
              {index <= stars && (
                <AntDesign name="star" size={50} color="#FFD700" style={styles.starFilled} />
              )}
            </Animated.View>
          ))}
        </View>

        {/* Performance Stats */}
        {totalQuestions > 0 && (
          <View style={styles.statsContainer}>
            {hintsUsed === 0 && mistakes === 0 ? (
              // Perfect performance message
              <View style={styles.flawlessContainer}>
                <Text style={styles.flawlessText}>✨ Flawless! ✨</Text>
                <Text style={styles.flawlessSubtext}>Perfect Performance!</Text>
              </View>
            ) : (
              // Show mistakes/hints as before
              <>
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
              </>
            )}
          </View>
        )}

        {/* Rewards */}

        {/* Gradient Buttons */}
        <Animated.View style={{ width: '100%', transform: [{ scale: nextButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={onNextLevel}
            onPressIn={() => {
              Animated.spring(nextButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(nextButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#1c92d6ff', '#3b80abff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Next Level</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Animated.View style={{ width: '100%', transform: [{ scale: menuButtonScale }] }}>
          <Pressable
            style={styles.button}
            onPress={onBackToMenu}
            onPressIn={() => {
              Animated.spring(menuButtonScale, {
                toValue: 0.95,
                useNativeDriver: true,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(menuButtonScale, {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
              }).start();
            }}
          >
            <LinearGradient
              colors={['#c53f3fff', '#fa000096']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Back to Menu</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {/* Fireworks Overlay for Milestones */}
      {isMilestone && (
        <View style={styles.fireworksContainer}>
          <LottieView
            source={require('../assets/images/fireworks.json')}
            autoPlay
            loop={true}
            style={styles.fireworksAnimation}
          />
        </View>
      )}
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
    maxHeight: 600,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: '#0f598aff',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#cbc32bc4',
    alignItems: 'center',
    shadowColor: '#000000ff',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.35,
    shadowRadius: 5.84,
    elevation: 10,
  },
  lottieAnimation: {
    width: 122,
    height: 122,
    marginBottom: 0,
    marginLeft: 9,
  },
  titleText: {
    color: '#FFD700',
    fontSize: 34,
    fontFamily: 'EagleLake-Regular',
    marginBottom: 5,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    justifyContent: 'center',
    gap: 8,
  },
  starWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starEmpty: {
    position: 'absolute',
  },
  starFilled: {
    position: 'absolute',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
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
    fontFamily: 'EagleLake-Regular',
  },
  statValue: {
    fontSize: 18,
    color: '#E1E2E1',
    fontFamily: 'EagleLake-Regular',
  },
  flawlessContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  flawlessText: {
    fontSize: 28,
    color: '#FFD700',
    fontFamily: 'EagleLake-Regular',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  flawlessSubtext: {
    fontSize: 16,
    color: '#4CAF50',
    fontFamily: 'EagleLake-Regular',
    marginTop: 4,
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
    fontSize: 26,
    color: '#FFD700',
    fontFamily: 'EagleLake-Regular',
  },
  button: {
    borderRadius: 25,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuButton: {
    backgroundColor: '#6d6967ff',
  },
  buttonText: {
    color: '#e2e2e1ff',
    fontSize: 24,
    fontFamily: 'EagleLake-Regular',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  milestoneIcon: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  fireworksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    pointerEvents: 'none',
  },
  fireworksAnimation: {
    width: 400,
    height: 400,
  },
});

export default LevelCompleteModal;