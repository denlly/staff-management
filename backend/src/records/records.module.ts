import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffRecord } from './record.entity';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([StaffRecord]), UsersModule],
  providers: [RecordsService],
  controllers: [RecordsController],
})
export class RecordsModule {}
