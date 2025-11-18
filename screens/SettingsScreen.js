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

  const handleQuit = () => {
    // In React Native, you can use BackHandler.exitApp() to exit the app.
    // However, it is not recommended on iOS.
    // A better approach is to navigate to the home screen.
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.modalView}>
        <Text style={styles.headerTitle}>Settings</Text>
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
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Quit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>◄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#1C3B4F',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    paddingTop: 10,
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
  quitButton: {
    marginTop: 20,
    backgroundColor: '#4A7E8E',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  quitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SettingsScreen;
