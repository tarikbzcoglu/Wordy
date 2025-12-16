import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';

export const useSound = (soundFile) => {
  const [sound, setSound] = useState();

  const playSound = useCallback(async () => {
    if (sound) {
      try {
        await sound.playFromPositionAsync(0);
      } catch (e) {
        // Silently fail if sound cannot be played (e.g. background mode)
      }
    }
  }, [sound]);

  useEffect(() => {
    let soundObject = null;
    let isMounted = true;

    const loadSound = async () => {
      try {
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
