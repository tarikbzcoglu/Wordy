import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { createContext, useEffect, useState } from 'react';

export const MusicContext = createContext();

const musicPlaylist = [
  require('../assets/sounds/mainmusic.mp3'),
  require('../assets/sounds/music2.mp3'),
  require('../assets/sounds/music3.mp3'),
  require('../assets/sounds/music4.mp3'),
];

export const MusicProvider = ({ children }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [soundObject, setSoundObject] = useState(null);
  const [isMusicEnabled, setIsMusicEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedVolume = await AsyncStorage.getItem('musicVolume');
        const savedMusicEnabled = await AsyncStorage.getItem('isMusicEnabled');

        if (savedVolume !== null) {
          setVolume(parseFloat(savedVolume));
        }
        if (savedMusicEnabled !== null) {
          setIsMusicEnabled(JSON.parse(savedMusicEnabled));
        }
      } catch (e) {
        console.error('MusicContext: Failed to load settings', e);
      } finally {
        setIsInitialized(true);
      }
    };
    loadSettings();
  }, []);

  // Effect to handle music playback
  useEffect(() => {
    if (!isInitialized) return; // Wait for settings to load

    let isMounted = true;
    const loadAndPlaySound = async () => {
      console.log('MusicContext: loadAndPlaySound triggered. isMusicEnabled:', isMusicEnabled, 'currentTrackIndex:', currentTrackIndex);
      if (soundObject) {
        console.log('MusicContext: Unloading previous soundObject.');
        await soundObject.unloadAsync();
      }
      if (isMusicEnabled) {
        try {
          console.log('MusicContext: Creating new sound for track:', musicPlaylist[currentTrackIndex]);
          const { sound } = await Audio.Sound.createAsync(
            musicPlaylist[currentTrackIndex],
            { shouldPlay: true, isLooping: false, volume: volume }
          );
          if (isMounted) {
            setSoundObject(sound);
            console.log('MusicContext: New soundObject set.');
            sound.setOnPlaybackStatusUpdate(status => {
              if (status.didJustFinish && !status.isLooping) {
                console.log('MusicContext: Track finished, advancing to next.');
                setCurrentTrackIndex(prevIndex => (prevIndex + 1) % musicPlaylist.length);
              }
            });
          } else {
            // Clean up if unmounted during loading
            sound.unloadAsync();
          }
        } catch (e) {
          console.error('MusicContext: Failed to load and play sound', e);
        }
      } else {
        console.log('MusicContext: Music is disabled, not loading/playing sound.');
      }
    };

    loadAndPlaySound();

    return () => {
      isMounted = false;
      console.log('MusicContext: Cleanup for loadAndPlaySound effect.');
      if (soundObject) {
        console.log('MusicContext: Unloading soundObject on cleanup.');
        soundObject.unloadAsync();
      }
    };
  }, [currentTrackIndex, isMusicEnabled, isInitialized]);

  // Effect to stop/play music based on isMusicEnabled state
  useEffect(() => {
    console.log('MusicContext: isMusicEnabled/soundObject change detected. isMusicEnabled:', isMusicEnabled, 'soundObject:', !!soundObject);
    if (soundObject) {
      if (isMusicEnabled) {
        console.log('MusicContext: Playing sound.');
        soundObject.playAsync();
      } else {
        console.log('MusicContext: Pausing sound.');
        soundObject.pauseAsync();
      }
    }
  }, [isMusicEnabled, soundObject]);

  // Effect to update volume and save to AsyncStorage
  useEffect(() => {
    if (soundObject) {
      soundObject.setVolumeAsync(volume);
    }
    // Save volume to AsyncStorage
    const saveVolume = async () => {
      try {
        await AsyncStorage.setItem('musicVolume', volume.toString());
      } catch (e) {
        console.error('MusicContext: Failed to save volume', e);
      }
    };
    if (isInitialized) {
      saveVolume();
    }
  }, [volume, soundObject, isInitialized]);

  return (
    <MusicContext.Provider value={{ isMusicEnabled, setIsMusicEnabled, volume, setVolume }}>
      {children}
    </MusicContext.Provider>
  );
};