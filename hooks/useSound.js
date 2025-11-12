import { useState, useEffect } from 'react';
import { Audio } from 'expo-av';

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

    const loadSound = async () => {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(soundFile);
        soundObject = newSound;
        setSound(newSound);
      } catch (e) {
        console.log('Error loading sound', e);
      }
    };

    loadSound();

    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
    };
  }, [soundFile]);

  return playSound;
};
