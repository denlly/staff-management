import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { UsersModule } from '../users/users.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule, UsersModule],
  providers: [RecordsService],
  controllers: [RecordsController],
})
export class RecordsModule {}
