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
