import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { UsersService } from '../users/users.service';
import { DatabaseService } from '../database/database.service';

export interface StaffRecordRow {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class RecordsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly usersService: UsersService,
  ) {}

  async create(userId: string, payload: CreateRecordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('登录状态已失效，请重新登录后再试');
    }

    const recordId = randomUUID();
    const now = new Date().toISOString();

    await this.databaseService.execute(
      `INSERT INTO records (id, title, content, userId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [recordId, payload.title, payload.content, userId, now, now],
    );

    return {
      id: recordId,
      title: payload.title,
      content: payload.content,
      userId,
      createdAt: now,
      updatedAt: now,
    };
  }

  async findAllByUser(userId: string) {
    const result = await this.databaseService.execute(
      `SELECT id, title, content, userId, createdAt, updatedAt
       FROM records
       WHERE userId = ?
       ORDER BY updatedAt DESC`,
      [userId],
    );
    return result.rows.map((row) =>
      this.mapRecordRow(row as Record<string, unknown>),
    );
  }

  async updateByUser(userId: string, id: string, payload: UpdateRecordDto) {
    const existing = await this.findByIdAndUser(id, userId);
    if (!existing) {
      throw new NotFoundException('记录不存在');
    }

    const updated = {
      ...existing,
      title: payload.title ?? existing.title,
      content: payload.content ?? existing.content,
      updatedAt: new Date().toISOString(),
    };

    await this.databaseService.execute(
      `UPDATE records
       SET title = ?, content = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`,
      [updated.title, updated.content, updated.updatedAt, id, userId],
    );

    return updated;
  }

  async removeByUser(userId: string, id: string) {
    const existing = await this.findByIdAndUser(id, userId);
    if (!existing) {
      throw new NotFoundException('记录不存在');
    }

    await this.databaseService.execute(
      `DELETE FROM records WHERE id = ? AND userId = ?`,
      [id, userId],
    );
    return { message: '删除成功' };
  }

  private async findByIdAndUser(id: string, userId: string) {
    const result = await this.databaseService.execute(
      `SELECT id, title, content, userId, createdAt, updatedAt
       FROM records
       WHERE id = ? AND userId = ?
       LIMIT 1`,
      [id, userId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRecordRow(result.rows[0] as Record<string, unknown>);
  }

  private mapRecordRow(row: Record<string, unknown>): StaffRecordRow {
    return {
      id: String(row.id),
      title: String(row.title),
      content: String(row.content),
      userId: String(row.userId),
      createdAt: String(row.createdAt),
      updatedAt: String(row.updatedAt),
    };
  }
}
