
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { MusicProvider } from '../context/MusicContext';
import GameScreen from '../screens/GameScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

export default function AppNavigator() {
  const [fontsLoaded] = Font.useFonts({
    'Papyrus': require('../assets/fonts/Papyrus.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
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
