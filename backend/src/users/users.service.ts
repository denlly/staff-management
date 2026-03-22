import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../database/database.service';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  resetPasswordToken: string | null;
  resetPasswordExpiresAt: Date | null;
}

function toNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  return typeof value === 'string' ? value : JSON.stringify(value);
}

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: {
    name: string;
    email: string;
    password: string;
    resetPasswordToken: string | null;
    resetPasswordExpiresAt: Date | null;
  }) {
    const userId = randomUUID();
    await this.databaseService.execute(
      `INSERT INTO users (id, name, email, password, resetPasswordToken, resetPasswordExpiresAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.name,
        data.email,
        data.password,
        data.resetPasswordToken,
        data.resetPasswordExpiresAt
          ? data.resetPasswordExpiresAt.toISOString()
          : null,
      ],
    );
    return this.findById(userId);
  }

  async findByEmail(email: string) {
    const result = await this.databaseService.execute(
      `SELECT id, name, email, password, resetPasswordToken, resetPasswordExpiresAt
       FROM users WHERE email = ? LIMIT 1`,
      [email],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapUserRow(result.rows[0]);
  }

  async findById(id: string) {
    const result = await this.databaseService.execute(
      `SELECT id, name, email, password, resetPasswordToken, resetPasswordExpiresAt
       FROM users WHERE id = ? LIMIT 1`,
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapUserRow(result.rows[0]);
  }

  async findByResetToken(token: string) {
    const result = await this.databaseService.execute(
      `SELECT id, name, email, password, resetPasswordToken, resetPasswordExpiresAt
       FROM users WHERE resetPasswordToken = ? LIMIT 1`,
      [token],
    );
    if (result.rows.length === 0) {
      return null;
    }
    return this.mapUserRow(result.rows[0]);
  }

  async updateResetToken(
    userId: string,
    token: string | null,
    expiresAt: Date | null,
  ) {
    await this.databaseService.execute(
      `UPDATE users
       SET resetPasswordToken = ?, resetPasswordExpiresAt = ?
       WHERE id = ?`,
      [token, expiresAt ? expiresAt.toISOString() : null, userId],
    );
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this.databaseService.execute(
      `UPDATE users
       SET password = ?, resetPasswordToken = NULL, resetPasswordExpiresAt = NULL
       WHERE id = ?`,
      [hashedPassword, userId],
    );
  }

  private mapUserRow(row: Record<string, unknown>): UserRecord {
    const resetPasswordToken = toNullableString(row.resetPasswordToken);
    const resetPasswordExpiresAt = toNullableString(row.resetPasswordExpiresAt);

    return {
      id: String(row.id),
      name: String(row.name),
      email: String(row.email),
      password: String(row.password),
      resetPasswordToken,
      resetPasswordExpiresAt: resetPasswordExpiresAt
        ? new Date(resetPasswordExpiresAt)
        : null,
    };
  }
}
