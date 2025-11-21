import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';

export const useSound = (soundFile) => {
  const [sound, setSound] = useState();

  const playSound = useCallback(async () => {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.log('Error replaying sound', e);
      }
    } else {
      console.log('Sound not loaded yet');
    }
  }, [sound]);

  useEffect(() => {
    let soundObject = null;
    let isMounted = true;

    const loadSound = async () => {
      try {
        // Ensure audio plays even in silent mode on iOS
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
        soundObject = newSound;

        if (isMounted) {
          setSound(newSound);
        } else {
          newSound.unloadAsync();
        }
      } catch (e) {
        console.log('Error loading sound', e);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [soundFile]);

  return playSound;
};
