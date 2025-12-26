import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const UsernameModal = ({ isVisible, onSubmit }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = () => {
        const trimmed = username.trim();
        if (trimmed.length >= 3) {
            onSubmit(trimmed);
        }
    };

    return (
        <Modal transparent visible={isVisible} animationType="fade">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.modalContent}>
                    <LottieView
                        source={require('../assets/images/owl_hi.json')}
                        autoPlay
                        loop={false}
                        style={styles.owlAnimation}
                    />
                    <Text style={styles.title}>Welcome to Wordy!</Text>
                    <Text style={styles.subtitle}>Enter your username!</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Your Name"
                        placeholderTextColor="#999"
                        value={username}
                        onChangeText={setUsername}
                        maxLength={15}
                        autoFocus
                        onSubmitEditing={handleSubmit}
                    />

                    <Text style={styles.hint}>Min 3 characters, max 15</Text>

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && styles.buttonPressed
                        ]}
                        onPress={handleSubmit}
                        disabled={username.trim().length < 3}
                    >
                        <LinearGradient
                            colors={username.trim().length >= 3 ? ['#26C6DA', '#66bb6ae6'] : ['#afb47dff', '#118bd7ff']}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Start Playing!</Text>
                        </LinearGradient>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#117799ff',
        borderRadius: 20,
        padding: 12,
        borderWidth: 2,
        borderColor: '#ffd900d3',
    },
    owlAnimation: {
        width: 120,
        height: 120,
        alignSelf: 'center',
        marginTop: -10,
        marginBottom: 0,
    },
    title: {
        fontSize: 28,
        color: '#FFD700',
        fontFamily: 'EagleLake-Regular',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#E1E2E1',
        fontFamily: 'EagleLake-Regular',
        textAlign: 'center',
        marginBottom: 25,
    },
    input: {
        backgroundColor: '#2C5F6F',
        borderRadius: 10,
        padding: 15,
        fontSize: 18,
        color: '#FFF',
        fontFamily: 'EagleLake-Regular',
        borderWidth: 2,
        borderColor: '#4A7E8E',
        textAlign: 'center',
    },
    hint: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'EagleLake-Regular',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    button: {
        borderRadius: 15,
        overflow: 'hidden',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonGradient: {
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 20,
        fontFamily: 'EagleLake-Regular',
    },
});

export default UsernameModal;
