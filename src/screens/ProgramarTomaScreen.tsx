// src/screens/ProgramarTomaScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { uuidv4 } from '../utils/uuid'; // Asegúrate de importar tu función personalizada
import { insertSchedule } from '../services/scheduleService';

type ProgramarTomaRouteProp = RouteProp<RootStackParamList, 'ProgramarToma'>;

export default function ProgramarTomaScreen() {
  const route = useRoute<ProgramarTomaRouteProp>();
  const navigation = useNavigation();
  const { medicineId } = route.params;

  const [cantidad, setCantidad] = useState('1');
  const [hora, setHora] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [diasSemana, setDiasSemana] = useState<Record<string, boolean>>({
    lun: false,
    mar: false,
    mie: false,
    jue: false,
    vie: false,
    sab: false,
    dom: false,
  });

  const toggleDia = (dia: string) => {
    setDiasSemana(prev => ({ ...prev, [dia]: !prev[dia] }));
  };

  const guardar = async () => {
    const diasSeleccionados = Object.keys(diasSemana).filter(k => diasSemana[k]);
    if (diasSeleccionados.length === 0) {
      Alert.alert('Selecciona al menos un día');
      return;
    }

    const schedule = {
      id: uuidv4(),
      medicineId,
      quantity: parseFloat(cantidad),
      times: JSON.stringify([hora.toTimeString().slice(0, 5)]),
      fromDate: new Date().toISOString().split('T')[0],
      daysOfWeek: diasSeleccionados.join(','),
    };

    try {
      await insertSchedule(schedule);
      Alert.alert('Toma programada correctamente');
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert('Error al guardar la toma');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Programar Toma</Text>

      <Text style={styles.label}>Cantidad:</Text>
      <TextInput
        style={styles.input}
        value={cantidad}
        onChangeText={setCantidad}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Hora:</Text>
      <Button title={hora.toTimeString().slice(0, 5)} onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={hora}
          mode="time"
          is24Hour={true}
          onChange={(_, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setHora(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Días de la semana:</Text>
      {Object.entries(diasSemana).map(([dia, activo]) => (
        <View key={dia} style={styles.diaRow}>
          <Text>{dia.toUpperCase()}</Text>
          <Switch value={activo} onValueChange={() => toggleDia(dia)} />
        </View>
      ))}

      <Button title="Guardar toma" onPress={guardar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10,
  },
  diaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4,
  },
});
