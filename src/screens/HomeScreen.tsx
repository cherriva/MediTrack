import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { Calendar } from 'react-native-calendars';
import {
  IntakeWithMedicine,
  getIntakesByDateRange,
} from '../services/intakeService';

export default function HomeScreen() {
  const { showActionSheetWithOptions } = useActionSheet();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [intakes, setIntakes] = useState<IntakeWithMedicine[]>([]);

  useEffect(() => {
    const load = async () => {
      const date = new Date(selectedDate);
      let start: Date;
      let end: Date;
      if (viewMode === 'day') {
        start = new Date(date);
        start.setHours(0, 0, 0, 0);
        end = new Date(date);
        end.setHours(23, 59, 59, 999);
      } else if (viewMode === 'week') {
        start = startOfWeek(date);
        end = endOfWeek(date);
      } else {
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      }
      const data = await getIntakesByDateRange(
        start.toISOString(),
        end.toISOString()
      );
      setIntakes(data);
    };
    load();
  }, [selectedDate, viewMode]);

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

  const markedDates: Record<string, any> = {
    [selectedDate]: { selected: true, selectedColor: '#007AFF' },
  };
  intakes.forEach((i) => {
    const date = i.expected_datetime.split('T')[0];
    markedDates[date] = markedDates[date] || { marked: true };
  });

  const grouped = intakes.reduce<Record<string, IntakeWithMedicine[]>>((acc, i) => {
    const date = i.expected_datetime.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(i);
    return acc;
  }, {});

  const groupedArray = Object.keys(grouped)
    .sort()
    .map((d) => ({ date: d, items: grouped[d] }));

  const renderGroup = ({ item }: { item: { date: string; items: IntakeWithMedicine[] } }) => (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{item.date}</Text>
      {item.items.map((i) => (
        <Text key={i.id} style={styles.intakeItem}>
          {formatTime(i.expected_datetime)} - {i.medicineName}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.modeSwitch}>
        {(
          [
            { key: 'day', label: 'Día' },
            { key: 'week', label: 'Semana' },
            { key: 'month', label: 'Mes' },
          ] as const
        ).map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.modeButton,
              viewMode === m.key && styles.modeButtonActive,
            ]}
            onPress={() => setViewMode(m.key)}
          >
            <Text
              style={viewMode === m.key && styles.modeButtonTextActive}
            >
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Calendar
        onDayPress={(d) => setSelectedDate(d.dateString)}
        markedDates={markedDates}
        current={selectedDate}
      />

      <FlatList
        data={groupedArray}
        keyExtractor={(item) => item.date}
        renderItem={renderGroup}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab} onPress={handleAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date: Date) {
  const d = startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function formatTime(iso: string) {
  return new Date(iso).toTimeString().slice(0, 5);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00000' },
  modeSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#007AFF',
  },
  modeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  list: {
    padding: 10,
  },
  group: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
  },
  groupTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#007AFF',
  },
  intakeItem: {
    marginLeft: 10,
    backgroundColor: '#dfe1ed',
    color: 'black',
    fontSize: 17,
    padding: 4,
    borderRadius: 4,
    marginBottom: 2,
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
