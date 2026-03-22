import { createClient } from '@libsql/client';
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'node:path';

dotenvConfig({ path: resolve(process.cwd(), '.env') });
dotenvConfig({ path: resolve(process.cwd(), '.env.local'), override: true });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken });

const statements = [
  'PRAGMA foreign_keys = ON',
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    resetPasswordToken TEXT,
    resetPasswordExpiresAt TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS records (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    userId TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )`,
  'CREATE INDEX IF NOT EXISTS idx_records_user_id ON records(userId)',
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
];

await client.batch(statements, 'write');
console.log('Turso schema initialized successfully.');
