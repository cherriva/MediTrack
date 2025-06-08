import { getDatabase } from './db';

export interface IntakeWithMedicine {
  id: string;
  schedule_id: string;
  expected_datetime: string;
  status: string;
  actual_datetime?: string | null;
  medicineName: string;
}

export async function getIntakesByDateRange(from: string, to: string): Promise<IntakeWithMedicine[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<IntakeWithMedicine>(
    `SELECT intake.id, intake.schedule_id, intake.expected_datetime, intake.status, intake.actual_datetime, medicine.name as medicineName
     FROM intake
     JOIN schedule ON intake.schedule_id = schedule.id
     JOIN medicine ON schedule.medicineId = medicine.id
     WHERE intake.expected_datetime BETWEEN ? AND ?
     ORDER BY intake.expected_datetime`,
    [from, to]
  );
  return result;
}

export interface IntakeStats {
  medicineId: string;
  medicineName: string;
  total: number;
  taken: number;
}

export async function getIntakeStats(): Promise<IntakeStats[]> {
  const db = await getDatabase();
  const result = await db.getAllAsync<IntakeStats>(
    `SELECT m.id as medicineId, m.name as medicineName,
            COUNT(i.id) as total,
            SUM(CASE WHEN i.status = 'taken' THEN 1 ELSE 0 END) as taken
     FROM intake i
     JOIN schedule s ON i.schedule_id = s.id
     JOIN medicine m ON s.medicineId = m.id
     GROUP BY m.id
     ORDER BY m.name`
  );
  return result;
}