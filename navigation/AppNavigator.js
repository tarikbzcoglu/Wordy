
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { MusicProvider } from '../context/MusicContext';
import GameScreen from '../screens/GameScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function AppNavigator() {
  const [fontsLoaded] = Font.useFonts({
    'Papyrus': require('../assets/fonts/Papyrus.ttf'),
    'EagleLake-Regular': require('../assets/fonts/EagleLake-Regular.ttf'),
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const soundAssets = [
          require('../assets/sounds/screentap.mp3'),
          require('../assets/sounds/correct.mp3'),
          require('../assets/sounds/wrong.mp3'),
          require('../assets/sounds/levelup.mp3'),
          require('../assets/sounds/timeup.mp3'),
          require('../assets/sounds/achievement.mp3'),
          require('../assets/sounds/hoot1.mp3'),
          require('../assets/sounds/hoot2.mp3'),
          require('../assets/sounds/hoot3.mp3'),
          require('../assets/sounds/hoot4.mp3'),
        ];
        await Promise.all(soundAssets.map(sound => Asset.fromModule(sound).downloadAsync()));
      } catch (e) {
        console.warn('Error downloading assets', e);
      } finally {
        setAssetsLoaded(true);
      }
    };
    loadAssets();
  }, []);

  useEffect(() => {
    if (fontsLoaded && assetsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, assetsLoaded]);

  if (!fontsLoaded || !assetsLoaded) {
    return null;
  }

  return (
    <MusicProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </MusicProvider>
  );
}
