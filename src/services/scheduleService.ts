import { getDatabase } from './db';
import { generateIntakesForSchedule } from './generateIntakesForSchedule';

export interface Schedule {
  id: string;
  medicineId: string;
  quantity: number;
  times: string;
  fromDate: string;
  toDate?: string;
  daysOfWeek?: string;
}

export async function insertSchedule(schedule: Schedule): Promise<void> {
  const db = await getDatabase(); // ✅ CORREGIDO aquí

  await db.runAsync(
    `INSERT INTO schedule (
      id, medicineId, quantity, times, fromDate, toDate, daysOfWeek
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      schedule.id,
      schedule.medicineId,
      schedule.quantity,
      schedule.times,
      schedule.fromDate,
      schedule.toDate ?? null,
      schedule.daysOfWeek ?? null,
    ]
  );

  await generateIntakesForSchedule(schedule);
}

export async function getSchedulesByMedicineId(medicineId: string): Promise<Schedule[]> {
  const db = await getDatabase(); // ✅ CORREGIDO aquí
  const result = await db.getAllAsync<Schedule>(
    `SELECT * FROM schedule WHERE medicineId = ?`,
    [medicineId]
  );
  return result;
}

export async function deleteSchedule(id: string): Promise<void> {
  const db = await getDatabase(); // ✅ CORREGIDO aquí
  await db.runAsync(`DELETE FROM schedule WHERE id = ?`, [id]);
}
