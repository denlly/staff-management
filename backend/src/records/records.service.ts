import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaffRecord } from './record.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(StaffRecord)
    private readonly recordsRepository: Repository<StaffRecord>,
  ) {}

  create(userId: string, payload: CreateRecordDto) {
    const record = this.recordsRepository.create({ ...payload, userId });
    return this.recordsRepository.save(record);
  }

  findAllByUser(userId: string) {
    return this.recordsRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async updateByUser(userId: string, id: string, payload: UpdateRecordDto) {
    const existing = await this.recordsRepository.findOne({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('记录不存在');
    }

    Object.assign(existing, payload);
    return this.recordsRepository.save(existing);
  }

  async removeByUser(userId: string, id: string) {
    const existing = await this.recordsRepository.findOne({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException('记录不存在');
    }
    await this.recordsRepository.remove(existing);
    return { message: '删除成功' };
  }
}
