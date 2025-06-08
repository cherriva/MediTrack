import React, { useEffect } from 'react';
import Navigation from './src/navigation/Navigation';
import { initDatabase } from './src/services/db';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // Add this
    shouldShowList: true,   // And this
  }),
});

export default function App() {
  useEffect(() => {
    const bootstrap = async () => {
      // 🧨 Solo para desarrollo: eliminar la base de datos anterior
      if (__DEV__) {
        try {
          await FileSystem.deleteAsync(`${FileSystem.documentDirectory}SQLite/meditrack.db`, {
            idempotent: true,
          });
          console.log('🧨 Base de datos eliminada');
        } catch (error) {
          console.error('❌ Error al eliminar la base de datos', error);
        }
      }

      // ✅ Crear tablas necesarias
      await initDatabase();

      // 🔔 Configurar notificaciones
      await configurarNotificaciones();
    };

    bootstrap();
  }, []);

  const configurarNotificaciones = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meditrack-channel', {
        name: 'Recordatorios de toma',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('❌ Permiso de notificaciones denegado');
    }
  };

  return (
    <ActionSheetProvider>
      <Navigation />
    </ActionSheetProvider>
  );
}
