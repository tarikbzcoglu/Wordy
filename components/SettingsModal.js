import React, { useContext } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Animated, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MusicContext } from '../context/MusicContext';
import Slider from '@react-native-community/slider';

const SettingsModal = ({ isVisible, onClose }) => {
  const { isMusicEnabled, setIsMusicEnabled, volume, setVolume } = useContext(MusicContext);
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

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.modalView}>
        <Text style={styles.headerTitle}>Settings</Text>
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
          <Text style={styles.settingText}>Volume</Text>
          <Slider
            style={{width: 200, height: 40}}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            value={volume}
            onValueChange={setVolume}
          />
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
            <Text style={styles.quitButtonText}>Quit</Text>
          </TouchableOpacity>
        </View>
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
      modalView: {
        margin: 20,
        backgroundColor: '#1C3B4F',
        borderRadius: 20,
        padding: 35,
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
        marginTop: 20,
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
        fontFamily: 'Papyrus',
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
        fontFamily: 'Papyrus',
      },
      headerTitle: {
        color: '#E1E2E1', // light_gray
        fontSize: 24,
        fontFamily: 'Papyrus',
        marginBottom: 20,
      },
      settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(225, 226, 225, 0.1)', // light_gray with opacity
      },
      settingText: {
        color: '#E1E2E1', // light_gray
        fontSize: 18,
        fontFamily: 'Papyrus',
      },
});

export default SettingsModal;
