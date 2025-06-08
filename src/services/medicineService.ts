import { getDatabase } from './db';
import { MedicineInput } from '../models/Medicine';

export async function insertMedicine(medicine: MedicineInput): Promise<void> {
  const db = await getDatabase(); // ← await añadido

  await db.runAsync(
    `INSERT INTO medicine (
      id, name, source, cima_id, dose, via_admin, form, lab, needs_rx, image_url, leaflet_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      medicine.id,
      medicine.name,
      medicine.source,
      medicine.cima_id ?? null,
      medicine.dose ?? null,
      medicine.via_admin ?? null,
      medicine.form ?? null,
      medicine.lab ?? null,
      medicine.needs_rx ? 1 : 0,
      medicine.image_url ?? null,
      medicine.leaflet_url ?? null
    ]
  );
}

export async function getAllMedicines(): Promise<MedicineInput[]> {
  const db = await getDatabase(); // ← await añadido
  const result = await db.getAllAsync<MedicineInput>(
    `SELECT * FROM medicine ORDER BY created_at DESC`
  );
  return result;
}

export async function deleteMedicine(id: string): Promise<void> {
  const db = await getDatabase(); // ← await añadido
  await db.runAsync(`DELETE FROM medicine WHERE id = ?`, [id]);
}
