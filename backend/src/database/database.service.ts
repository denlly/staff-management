import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type Client, type InArgs } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

function resolveDatabaseUrl(configService: ConfigService) {
  const tursoUrl = configService.get<string>('TURSO_DATABASE_URL');
  if (tursoUrl) {
    return tursoUrl;
  }

  const dbPath = configService.get<string>(
    'DB_PATH',
    'data/staff_management.sqlite',
  );
  if (!dbPath.startsWith('file:')) {
    mkdirSync(dirname(dbPath), { recursive: true });
    return `file:${dbPath}`;
  }
  return dbPath;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url: resolveDatabaseUrl(configService),
      authToken: configService.get<string>('TURSO_AUTH_TOKEN'),
    });
  }

  async onModuleInit() {
    await this.client.execute('PRAGMA foreign_keys = ON');
    await this.initSchema();
    this.logger.log('Database schema is ready');
  }

  execute(sql: string, args?: InArgs) {
    return this.client.execute({ sql, args });
  }

  async initSchema() {
    await this.client.batch(
      [
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
      ],
      'write',
    );
  }
}
