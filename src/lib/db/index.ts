import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database('./data/movies.db');
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
const migrationsFolder = path.join(process.cwd(), 'drizzle');
if (fs.existsSync(migrationsFolder)) {
  migrate(db, { migrationsFolder });
}
