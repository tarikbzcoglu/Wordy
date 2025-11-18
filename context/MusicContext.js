import React, { createContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Effect to handle music playback
  useEffect(() => {
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
            { shouldPlay: true, isLooping: false }
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
  }, [currentTrackIndex, isMusicEnabled]); // Removed soundObject from dependencies

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

  return (
    <MusicContext.Provider value={{ isMusicEnabled, setIsMusicEnabled }}>
      {children}
    </MusicContext.Provider>
  );
};