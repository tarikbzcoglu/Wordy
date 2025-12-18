import * as Updates from 'expo-updates';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

class ErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleRestart = async () => {
        try {
            await Updates.reloadAsync();
        } catch (e) {
            console.log('Error restarting app', e);
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.title}>Oops! Something went wrong.</Text>
                    <Text style={styles.subtitle}>We're sorry for the inconvenience.</Text>
                    <Pressable onPress={this.handleRestart} style={styles.button}>
                        <Text style={styles.buttonText}>Restart App</Text>
                    </Pressable>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1C3B4F',
        padding: 20,
    },
    title: {
        fontSize: 24,
        color: '#FFD700',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#E1E2E1',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#3B6E7E',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        elevation: 3,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default ErrorBoundary;
