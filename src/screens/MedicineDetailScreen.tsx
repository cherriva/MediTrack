// src/screens/MedicineDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Linking,
  Image,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { MedicineInput } from '../models/Medicine';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllMedicines } from '../services/medicineService';

type DetailRouteProp = RouteProp<RootStackParamList, 'MedicineDetail'>;

export default function MedicineDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { id } = route.params;

  const [medicine, setMedicine] = useState<MedicineInput | null>(null);

  useEffect(() => {
    const fetchMedicine = async () => {
      const all = await getAllMedicines();
      const med = all.find(m => m.id === id);
      setMedicine(med ?? null);
    };

    fetchMedicine();
  }, [id]);

  if (!medicine) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Medicamento no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{medicine.name}</Text>
      {medicine.image_url && (
        <Image source={{ uri: medicine.image_url }} style={styles.image} />
      )}
      {medicine.dose && <Text style={styles.text}>💊 Dosis: {medicine.dose}</Text>}
      {medicine.via_admin && <Text style={styles.text}>🧪 Vía: {medicine.via_admin}</Text>}
      {medicine.form && <Text style={styles.text}>🧬 Forma: {medicine.form}</Text>}
      {medicine.lab && <Text style={styles.text}>🏭 Lab: {medicine.lab}</Text>}
      <Text style={styles.text}>
        {medicine.needs_rx ? '📋 Requiere receta' : '🔓 Sin receta'}
      </Text>

      {medicine.leaflet_url && (
        <Button
          title="Ver prospecto"
          onPress={() => Linking.openURL(medicine.leaflet_url!)}
        />
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="➕ Programar toma"
          onPress={() => {
            navigation.navigate('ProgramarToma', { medicineId: medicine.id });
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
  },
});
