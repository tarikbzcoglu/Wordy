import React, { useContext } from 'react'; // Import useContext
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MusicContext } from '../context/MusicContext'; // Import MusicContext

const SettingsScreen = ({ navigation }) => { // Removed setIsMusicEnabledProp from props
  const { isMusicEnabled, setIsMusicEnabled } = useContext(MusicContext); // Use MusicContext

  const toggleMusic = async () => {
    const newState = !isMusicEnabled;
    setIsMusicEnabled(newState);
    console.log('SettingsScreen: Toggling music to:', newState);
    try {
      await AsyncStorage.setItem('isMusicEnabled', JSON.stringify(newState));
    } catch (e) {
      console.error('Failed to save music setting.', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>◄</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerButtonPlaceholder} />
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Background Music</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#4A7E8E' }}
          thumbColor={isMusicEnabled ? '#68919E' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleMusic}
          value={isMusicEnabled}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(28, 59, 79, 0.7)', // Use a semi-transparent charcoal
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    paddingTop: 30, // Safe area for iOS
    backgroundColor: '#1C3B4F', // charcoal
    borderBottomWidth: 1,
    borderBottomColor: '#4A7E8E', // air_force_blue
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonPlaceholder: {
    width: 40, // To balance the header layout
  },
  headerButtonText: {
    color: '#E1E2E1', // light_gray
    fontSize: 20,
    fontFamily: 'Papyrus',
  },
  headerTitle: {
    color: '#E1E2E1', // light_gray
    fontSize: 24,
    fontFamily: 'Papyrus',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(225, 226, 225, 0.1)', // light_gray with opacity
  },
  settingText: {
    color: '#E1E2E1', // light_gray
    fontSize: 18,
    fontFamily: 'Papyrus',
  },
});

export default SettingsScreen;
