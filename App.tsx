import React, { useEffect } from 'react';
import Navigation from './src/navigation/Navigation';
import { initDatabase } from './src/services/db';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import * as FileSystem from 'expo-file-system';

export default function App() {
  useEffect(() => {
    const resetDB = async () => {
      try {
        // 🧨 Borra la base de datos SQLite si existe
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}SQLite/meditrack.db`, {
          idempotent: true,
        });
        console.log('🧨 Base de datos eliminada');
      } catch (error) {
        console.error('❌ Error al eliminar la base de datos', error);
      }

      // ✅ Inicializa la base de datos con la estructura correcta
      await initDatabase();
    };

    resetDB(); // Solo la primera vez para corregir columnas
  }, []);

  return (
    <ActionSheetProvider>
      <Navigation />
    </ActionSheetProvider>
  );
}
