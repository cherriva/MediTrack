import React, { useEffect } from 'react';
import Navigation from './src/navigation/Navigation';
import { initDatabase } from './src/services/db';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { updateIntakeStatus, updateIntakeTime } from './src/services/intakeService';

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

    const sub = Notifications.addNotificationResponseReceivedListener(async (r) => {
      const intakeId = r.notification.request.content.data?.intakeId as string | undefined;
      if (!intakeId) return;

      Alert.alert(
        'Recordatorio',
        '¿Has tomado la medicación?',
        [
          {
            text: 'Tomada',
            onPress: () => updateIntakeStatus(intakeId, 'taken'),
          },
          {
            text: 'Posponer',
            onPress: async () => {
              const newDate = new Date();
              newDate.setMinutes(newDate.getMinutes() + 15);
              await updateIntakeTime(intakeId, newDate.toISOString());
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: '💊 Hora de tomar tu medicina',
                  body: 'No olvides tu dosis programada.',
                  sound: 'default',
                  categoryIdentifier: 'MEDICINE_ALARM',
                  data: { intakeId },
                },
                trigger: { date: newDate, channelId: 'meditrack-channel' },
              });
            },
          },
          {
            text: 'Cancelar',
            style: 'destructive',
            onPress: () => updateIntakeStatus(intakeId, 'cancelled'),
          },
        ]
      );
    });

    return () => {
      sub.remove();
    };
  }, []);

  const configurarNotificaciones = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('meditrack-channel', {
        name: 'Recordatorios de toma',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
      });
    }

    await Notifications.setNotificationCategoryAsync('MEDICINE_ALARM', []);

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
