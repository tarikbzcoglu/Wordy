import { Audio } from 'expo-av';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  useEffect(() => {
    const initApp = async () => {
      if (Platform.OS === 'android') {
        // Hide navigation bar for immersive mode
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      }

      // Configure audio mode once at startup
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    };

    initApp();
  }, []);

  return <AppNavigator />;
}
