import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a MediTrack 🩺</Text>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  text: {
    fontSize: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 20,
    elevation: 4,
  },
  fabText: {
    color: 'white',
    fontSize: 24,
  },
});

