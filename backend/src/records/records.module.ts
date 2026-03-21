import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRecord } from './record.entity';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StaffRecord])],
  providers: [RecordsService],
  controllers: [RecordsController],
})
export class RecordsModule {}
