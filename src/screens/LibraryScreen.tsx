import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { getAllMedicines, deleteMedicine } from '../services/medicineService';
import type { MedicineInput } from '../models/Medicine';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


export default function LibraryScreen() {
  const [medicines, setMedicines] = useState<MedicineInput[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const loadMedicines = async () => {
    const result = await getAllMedicines();
    setMedicines(result);
  };

  useFocusEffect(
    useCallback(() => {
      loadMedicines();
    }, [])
  );

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Eliminar medicamento',
      '¿Estás seguro de que quieres eliminar este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteMedicine(id);
            await loadMedicines();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: MedicineInput }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('MedicineDetail', { id: item.id })}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            {item.dose && <Text style={styles.dose}>💊 {item.dose}</Text>}
            <Text style={styles.source}>
              {item.source === 'manual' ? '📝 Añadido manualmente' : '🌐 Desde CIMA'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // ⛔ Evita que se abra el detalle
              confirmDelete(item.id);
            }}
          >
            <MaterialIcons name="delete" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {medicines.length === 0 ? (
        <Text style={styles.empty}>No hay medicamentos guardados.</Text>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  dose: {
    fontSize: 14,
    marginTop: 4,
  },
  source: {
    fontSize: 12,
    marginTop: 8,
    color: '#555',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#999',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
