import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecordsModule } from './records/records.module';
import { User } from './users/user.entity';
import { StaffRecord } from './records/record.entity';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>(
          'DB_PATH',
          'data/staff_management.sqlite',
        ),
        entities: [User, StaffRecord],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    RecordsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
