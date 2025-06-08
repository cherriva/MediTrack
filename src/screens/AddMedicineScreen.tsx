import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet, Alert } from 'react-native';
import { insertMedicine } from '../services/medicineService';
import { useNavigation } from '@react-navigation/native';
import { uuidv4 } from '../utils/uuid';

export default function AddMedicineScreen() {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [needsRx, setNeedsRx] = useState(false);
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'El nombre del medicamento es obligatorio');
      return;
    }

    try {
      await insertMedicine({
        id: uuidv4(),
        name,
        source: 'manual',
        dose,
        needs_rx: needsRx
      });

      Alert.alert('Éxito', 'Medicamento guardado');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nombre:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Dosis:</Text>
      <TextInput style={styles.input} value={dose} onChangeText={setDose} placeholder="Ej: 500 mg" />

      <View style={styles.switchContainer}>
        <Text>¿Requiere receta?</Text>
        <Switch value={needsRx} onValueChange={setNeedsRx} />
      </View>

      <Button title="Guardar medicamento" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  label: { marginTop: 20, fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
});

