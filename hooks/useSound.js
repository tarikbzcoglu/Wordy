import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

export const useSound = (soundFile) => {
  const [sound, setSound] = useState();

  async function playSound() {
    if (sound) {
      try {
        await sound.replayAsync();
      } catch (e) {
        console.log('Error replaying sound', e);
      }
    }
  }

  useEffect(() => {
    let soundObject = null;
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
        soundObject = newSound;
        // Only update state if component is still mounted
        if (isMounted) {
          setSound(newSound);
        } else {
          // If unmounted during loading, clean up immediately
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
