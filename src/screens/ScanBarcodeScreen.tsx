import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { insertMedicine } from '../services/medicineService';
import type { RootStackParamList } from '../navigation/types';
import { uuidv4 } from '../utils/uuid';

export default function ScanBarcodeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  // Flag síncrono para bloquear eventos repetidos
  const scannedRef = useRef(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const isFocused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cameraRef = useRef<React.ElementRef<typeof CameraView> | null>(null);

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scannedRef.current) return;          // ← bloqueo inmediato
    scannedRef.current = true;               // ← marcamos como ya escaneado
    setScanned(true);                        // ← actualizamos UI

    // Regex EAN13 farmacia española
    const pharmaRegex = /^847000(\d{6})\d$/;
    const match = data.match(pharmaRegex);
    if (!match) {
      Alert.alert('Error', 'Formato de EAN13 no válido para presentación farmacéutica', [
        { text: 'Escanear de nuevo', onPress: () => {
            scannedRef.current = false;
            setScanned(false);
        }}
      ]);
      return;
    }
    const cn = match[1];

    try {
      const res = await fetch(`https://cima.aemps.es/cima/rest/medicamento?cn=${cn}`);
      if (!res.ok) throw new Error(`CN ${cn} no encontrado`);
      const text = await res.text();
      if (!text) throw new Error(`CN ${cn} sin datos`);
      const med = JSON.parse(text);
      if (!med.nombre) throw new Error('Respuesta inválida de CIMA');

      const saveMedicine = async () => {
        await insertMedicine({
          id:           uuidv4(),
          name:         med.nombre,
          source:       'cima',
          cima_id:      med.nregistro,
          dose:         med.dosis,
          via_admin:    med.viasAdministracion?.map((v: any) => v.nombre).join(', '),
          form:         med.formaFarmaceutica?.nombre,
          lab:          med.labtitular,
          needs_rx:     med.receta,
          image_url:    med.fotos?.[0]?.url ?? null,
          leaflet_url:  med.docs?.find((d: any) => d.tipo === 1)?.url ?? null,
        });
        Alert.alert('Guardado', `Se guardó: ${med.nombre}`, [
          {
            text: 'OK',
            onPress: () => navigation.replace('Tabs'),
          }
        ]);
      };

      Alert.alert(
        'Medicamento encontrado',
        med.nombre,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              scannedRef.current = false;
              setScanned(false);
              navigation.goBack();
            },
          },
          { text: 'Guardar', onPress: saveMedicine }
        ],
        { cancelable: false }
      );

    } catch (e: any) {
      console.error(e);
      Alert.alert(
        'Error',
        e.message || 'Fallo en consulta CIMA',
        [
          { text: 'Escanear de nuevo', onPress: () => {
              scannedRef.current = false;
              setScanned(false);
          }},
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => {
              scannedRef.current = false;
              setScanned(false);
              navigation.goBack();
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={facing}
          active={!!permission?.granted}
          autofocus="on"
          onCameraReady={() => console.log('Camera ready')}
          onMountError={(e) => console.log('Camera mount error', e)}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13','ean8','code128','upc_a','upc_e'],
          }}
        />
      )}

      {permission?.granted && !scanned && isFocused && (
        <View style={styles.overlay}>
          <View style={styles.markerBox} />
          <Text style={styles.scanningText}>Escaneando...</Text>
        </View>
      )}

      {!permission?.granted && (
        <View style={styles.permissionOverlay}>
          <Text style={styles.infoText}>Necesitamos permiso para la cámara</Text>
          <Button title="Permitir cámara" onPress={requestPermission} />
        </View>
      )}

      {permission?.granted && scanned && (
        <View style={styles.scanAgain}>
          <Button
            title="Escanear de nuevo"
            onPress={() => {
              scannedRef.current = false;  // ← desbloqueo ref
              setScanned(false);           // ← reset estado
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera:    { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerBox: {
    width: 250, height: 150,
    borderWidth: 2, borderColor: 'white', borderRadius: 8,
  },
  scanningText: {
    color: 'white', marginTop: 16,
    fontSize: 18, fontWeight: 'bold',
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  infoText:    { color: 'white', marginBottom: 10 },
  scanAgain: {
    position: 'absolute', bottom: 40, alignSelf: 'center',
  },
});
