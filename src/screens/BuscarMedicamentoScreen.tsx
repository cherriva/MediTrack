// src/screens/BuscarMedicamentoScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { insertMedicine } from '../services/medicineService';
import { uuidv4 } from '../utils/uuid';

export default function BuscarMedicamentoScreen() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const buscar = async () => {
    if (!busqueda) return;
    setCargando(true);

    try {
      const response = await fetch(
        `https://cima.aemps.es/cima/rest/medicamentos?nombre=${encodeURIComponent(busqueda)}`
      );
      const data = await response.json();
      setResultados(data.resultados ?? []);
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const guardarMedicamento = async (item: any) => {
    try {
      await insertMedicine({
        id: uuidv4(),
        name: item.nombre,
        source: 'cima',
        cima_id: item.nregistro,
        dose: item.dosis,
        via_admin: item.viasAdministracion?.map((v: any) => v.nombre).join(', '),
        form: item.formaFarmaceutica?.nombre,
        lab: item.labtitular,
        needs_rx: item.receta,
        image_url: item.fotos?.[0]?.url ?? null,
        leaflet_url: item.docs?.find((d: any) => d.tipo === 1)?.url ?? null,
      });

      Alert.alert('Medicamento guardado', `${item.nombre} añadido a tu biblioteca`);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Buscar en la base CIMA</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: ibuprofeno"
        value={busqueda}
        onChangeText={setBusqueda}
        onSubmitEditing={buscar}
      />
      <TouchableOpacity style={styles.botonBuscar} onPress={buscar}>
        <Text style={styles.botonBuscarTexto}>Buscar</Text>
      </TouchableOpacity>

      {cargando ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.nregistro}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.lab}>{item.labtitular}</Text>
              <TouchableOpacity onPress={() => guardarMedicamento(item)}>
                <Text style={styles.botonGuardar}>➕ Añadir</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 6, marginBottom: 10,
  },
  botonBuscar: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 20,
  },
  botonBuscarTexto: {
    color: 'white', textAlign: 'center', fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  nombre: { fontWeight: '600', fontSize: 16 },
  lab: { fontSize: 14, color: '#555', marginVertical: 4 },
  botonGuardar: { color: '#007AFF', fontWeight: 'bold', marginTop: 5 },
});

