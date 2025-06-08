import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getIntakeStats, IntakeStats } from '../services/intakeService';

export default function HistoryScreen() {
  const navigation = useNavigation(); // 👈 Ahora correctamente dentro del componente
  const [stats, setStats] = useState<IntakeStats[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await getIntakeStats();
      setStats(data);
    };
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }: { item: IntakeStats }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.medicineName}</Text>
      <Text style={styles.count}>{item.taken}/{item.total} tomadas</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Estadísticas de Tomas</Text>
      {stats.length === 0 ? (
        <Text style={styles.empty}>No hay registros</Text>
      ) : (
        <FlatList
          data={stats}
          keyExtractor={(item) => item.medicineId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  list: { paddingBottom: 20 },
  card: { backgroundColor: '#f2f2f2', padding: 15, borderRadius: 8, marginBottom: 12 },
  name: { fontSize: 16, fontWeight: '600' },
  count: { marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
