import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('meditrack.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS medicine (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          source TEXT NOT NULL,
          cima_id TEXT,
          dose TEXT,
          via_admin TEXT,
          form TEXT,
          lab TEXT,
          needs_rx INTEGER CHECK (needs_rx IN (0,1)),
          image_url TEXT,
          leaflet_url TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS schedule (
          id TEXT PRIMARY KEY,
          medicineId TEXT NOT NULL,
          quantity REAL NOT NULL,
          times TEXT NOT NULL,
          fromDate TEXT NOT NULL,
          toDate TEXT,
          daysOfWeek TEXT,
          FOREIGN KEY (medicineId) REFERENCES medicine(id) ON DELETE CASCADE
        );


        CREATE TABLE IF NOT EXISTS intake (
          id TEXT PRIMARY KEY,
          schedule_id TEXT NOT NULL,
          expected_datetime TEXT NOT NULL,
          status TEXT NOT NULL,
          actual_datetime TEXT,
          FOREIGN KEY (schedule_id) REFERENCES schedule(id) ON DELETE CASCADE
        );
      `);

      console.log('✅ Base de datos inicializada');
      return db;
    });
  }

  return dbPromise;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) throw new Error('⚠️ Database not initialized');
  return dbPromise;
}
