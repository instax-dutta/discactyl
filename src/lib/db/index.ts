import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { env } from '../../config/env';
import { logger } from '../logger';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(env.DATABASE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(env.DATABASE_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    logger.info({ path: env.DATABASE_PATH }, 'Database connected');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    logger.info('Database closed');
  }
}
