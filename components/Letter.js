
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Letter({ letter }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 1,
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
});
