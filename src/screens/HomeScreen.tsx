// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

export default function HomeScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleAdd = () => {
    const options = ['Añadir manualmente', 'Buscar en CIMA', 'Cancelar'];
    const cancelButtonIndex = 2;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (selectedIndex) => {
        if (selectedIndex === 0) {
          navigation.navigate('AddMedicine');
        } else if (selectedIndex === 1) {
          navigation.navigate('BuscarMedicamento');
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bienvenido a MediTrack 🩺</Text>

      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
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
