
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Letter from './Letter';

export default function Word({ word }) {
  return (
    <View style={styles.container}>
      {word.map((letter, index) => (
        <Letter key={index} letter={letter} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});
