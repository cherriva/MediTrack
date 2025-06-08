import { getDatabase } from './db';
import type { Schedule } from './scheduleService';
import { uuidv4 } from '../utils/uuid';
import * as Notifications from 'expo-notifications';

export async function generateIntakesForSchedule(schedule: Schedule): Promise<void> {
  const db = await getDatabase();

  const start = new Date(schedule.fromDate);
  const end = schedule.toDate ? new Date(schedule.toDate) : new Date();
  end.setMonth(end.getMonth() + 1);

  const diasSemana = (schedule.daysOfWeek ?? '').split(',');
  const horas: string[] = JSON.parse(schedule.times);

  const diasPermitidos: Record<string, number> = {
    dom: 0, lun: 1, mar: 2, mie: 3, jue: 4, vie: 5, sab: 6,
  };

  const intakes: [string, string, string, string][] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayNum = d.getDay();
    const permitido = Object.entries(diasPermitidos).some(
      ([k, v]) => diasSemana.includes(k) && v === dayNum
    );

    if (permitido) {
      for (const h of horas) {
        const [hour, minute] = h.split(':');
        const date = new Date(d);
        date.setHours(Number(hour), Number(minute), 0, 0);
        intakes.push([
          uuidv4(),
          schedule.id,
          date.toISOString(),
          'pending',
        ]);
      }
    }
  }

  if (intakes.length === 0) {
    console.log('⚠️ No se han generado tomas para esta pauta.');
    return;
  }

  const insertQuery = `
    INSERT INTO intake (id, schedule_id, expected_datetime, status)
    VALUES (?, ?, ?, ?)
  `;

  try {
    for (const intake of intakes) {
      await db.runAsync(insertQuery, intake);
    }
    console.log(`✅ Se generaron ${intakes.length} tomas (intakes)`);
  } catch (error) {
    console.error('❌ Error al insertar intakes:', error);
    throw error;
  }

// 📅 Programar una notificación para cada toma generada
let notificaciones = 0;
for (const [id, , datetime] of intakes) {
  const triggerDate = new Date(datetime);

  try {
    const trigger: Notifications.CalendarTriggerInput = {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      year: triggerDate.getFullYear(),
      month: triggerDate.getMonth() + 1, // ¡Ojo! Enero = 0 en JS, pero = 1 en CalendarTriggerInput
      day: triggerDate.getDate(),
      hour: triggerDate.getHours(),
      minute: triggerDate.getMinutes(),
      second: 0,
      repeats: false,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Hora de tomar tu medicina',
        body: 'No olvides tu dosis programada.',
        sound: 'default',
        categoryIdentifier: 'MEDICINE_ALARM',
        data: { intakeId: id },
      },
      trigger,
    });

    notificaciones++;
  } catch (err) {
    console.error('❌ Error al programar notificación:', err);
  }
}

console.log(`🔔 ${notificaciones} notificaciones individuales programadas`);

}
