import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  try {

    db = await SQLite.openDatabaseAsync('meditrack.db');

    // Activa las claves foráneas y crea las tablas
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
        medicine_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT,
        days_of_week TEXT NOT NULL,
        times TEXT NOT NULL,
        quantity REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (medicine_id) REFERENCES medicine(id) ON DELETE CASCADE
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

    console.log('✅ Base de datos inicializada con openDatabaseAsync');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  }
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized');
  return db;
}
