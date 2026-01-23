import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { useContext } from 'react';
import { Animated, BackHandler, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { MusicContext } from '../context/MusicContext';

const APP_VERSION = '1.0.0';
const SUPPORT_EMAIL = 'support@wordy.app'; // Kendi email adresinizi yazın
const PRIVACY_POLICY_URL = 'https://wordy.app/privacy'; // Kendi URL'nizi yazın
const TERMS_OF_SERVICE_URL = 'https://wordy.app/terms'; // Kendi URL'nizi yazın

const SettingsModal = ({ isVisible, onClose }) => {
  const { isMusicEnabled, setIsMusicEnabled, volume, setVolume, sfxVolume, setSfxVolume } = useContext(MusicContext);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, fadeAnim]);

  const toggleMusic = async () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    try {
      await AsyncStorage.setItem('isMusicEnabled', JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save music setting.', e);
    }
  };

  const handleQuit = () => {
    // Note: BackHandler.exitApp() is not recommended on iOS.
    BackHandler.exitApp();
  };

  const handleSendFeedback = async () => {
    const subject = encodeURIComponent(`Wordy Feedback - v${APP_VERSION}`);
    const body = encodeURIComponent(`
---
Device: ${Platform.OS} ${Platform.Version}
App Version: ${APP_VERSION}
---

`);
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      console.error('Could not open email client:', error);
    }
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
    } catch (error) {
      console.error('Could not open privacy policy:', error);
    }
  };

  const handleOpenTermsOfService = async () => {
    try {
      await WebBrowser.openBrowserAsync(TERMS_OF_SERVICE_URL);
    } catch (error) {
      console.error('Could not open terms of service:', error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <TouchableWithoutFeedback>
          <View style={styles.modalView}>
            <Text style={styles.headerTitle}>Settings</Text>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              {/* Audio Settings */}
              <View style={styles.settingItem}>
                <Text style={styles.settingText}>Background Music</Text>
                <Switch
                  trackColor={{ false: '#767577', true: '#4A7E8E' }}
                  thumbColor={isMusicEnabled ? '#68919E' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={toggleMusic}
                  value={isMusicEnabled}
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingText}>Music Volume</Text>
                <Slider
                  style={{ width: 140, height: 40 }}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#4A7E8E"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#4A7E8E"
                  value={volume}
                  onValueChange={setVolume}
                />
              </View>
              <View style={styles.settingItem}>
                <Text style={styles.settingText}>SFX Volume</Text>
                <Slider
                  style={{ width: 140, height: 40 }}
                  minimumValue={0}
                  maximumValue={1}
                  minimumTrackTintColor="#4A7E8E"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#4A7E8E"
                  value={sfxVolume}
                  onValueChange={setSfxVolume}
                />
              </View>

              {/* Support & Legal Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Support & Legal</Text>
              </View>

              <TouchableOpacity style={styles.linkItem} onPress={handleSendFeedback}>
                <Text style={styles.linkIcon}>📧</Text>
                <Text style={styles.linkText}>Send Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkItem} onPress={handleOpenPrivacyPolicy}>
                <Text style={styles.linkIcon}>🔒</Text>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkItem} onPress={handleOpenTermsOfService}>
                <Text style={styles.linkIcon}>📄</Text>
                <Text style={styles.linkText}>Terms of Service</Text>
              </TouchableOpacity>

              {/* App Version */}
              <Text style={styles.versionText}>Version {APP_VERSION}</Text>
            </ScrollView>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
                <Text style={styles.quitButtonText}>Quit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 2000,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1C3B4F',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 15,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#4A7E8E',
  },
  backButtonText: {
    color: '#E1E2E1', // light_gray
    fontSize: 18,
    fontFamily: 'EagleLake-Regular',
  },
  quitButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
  },
  quitButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'EagleLake-Regular',
  },
  headerTitle: {
    color: '#E1E2E1', // light_gray
    fontSize: 26,
    fontFamily: 'EagleLake-Regular',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 226, 225, 0.1)', // light_gray with opacity
  },
  settingText: {
    color: '#E1E2E1', // light_gray
    fontSize: 18,
    fontFamily: 'EagleLake-Regular',
  },
  scrollView: {
    width: '100%',
    maxHeight: 380,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(225, 226, 225, 0.2)',
  },
  sectionHeaderText: {
    color: '#68919E',
    fontSize: 14,
    fontFamily: 'EagleLake-Regular',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  linkIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  linkText: {
    color: '#E1E2E1',
    fontSize: 16,
    fontFamily: 'EagleLake-Regular',
  },
  versionText: {
    color: 'rgba(225, 226, 225, 0.5)',
    fontSize: 12,
    fontFamily: 'EagleLake-Regular',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default SettingsModal;
