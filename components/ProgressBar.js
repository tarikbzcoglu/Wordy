import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

/**
 * ProgressBar Component
 * Shows current progress within a level
 */
const ProgressBar = ({ current, total, style }) => {
    const progress = total > 0 ? (current / total) * 100 : 0;

    return (
        <View style={[styles.container, style]}>
            <View style={styles.progressBarContainer}>
                <LinearGradient
                    colors={['#FFD700', '#FFA500']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                />
                <View style={styles.progressOverlay} />
            </View>
            <Text style={styles.progressText}>
                {current}/{total}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        gap: 2,
    },
    progressBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    progressFill: {
        height: '100%',
        borderRadius: 10,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 3,
    },
    progressOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 10,
    },
    progressText: {
        color: '#FFD700',
        fontSize: 11,
        fontFamily: 'Papyrus',
        fontWeight: 'bold',
        minWidth: 32,
        textAlign: 'right',
    },
});

export default ProgressBar;
