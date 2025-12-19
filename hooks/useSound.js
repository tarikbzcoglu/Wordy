import { Audio } from 'expo-av';
import { useCallback, useContext, useEffect, useState } from 'react';
import { MusicContext } from '../context/MusicContext';

export const useSound = (soundFile) => {
  const [sound, setSound] = useState();
  const { sfxVolume } = useContext(MusicContext);

  const playSound = useCallback(async () => {
    if (sound) {
      try {
        await sound.setVolumeAsync(sfxVolume);
        await sound.playFromPositionAsync(0);
      } catch (e) {
        // Silently fail if sound cannot be played (e.g. background mode)
      }
    }
  }, [sound, sfxVolume]);

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
