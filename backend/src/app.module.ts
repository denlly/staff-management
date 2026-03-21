import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RecordsModule } from './records/records.module';
import { User } from './users/user.entity';
import { StaffRecord } from './records/record.entity';
import { AppController } from './app.controller';

function resolveDbPath(configService: ConfigService) {
  const configuredPath = configService.get<string>('DB_PATH');

  // Vercel serverless filesystem is writable only under /tmp.
  if (process.env.VERCEL) {
    if (!configuredPath || configuredPath.startsWith('data/')) {
      return '/tmp/staff_management.sqlite';
    }
    return configuredPath;
  }

  const localPath = configuredPath ?? 'data/staff_management.sqlite';
  mkdirSync(dirname(localPath), { recursive: true });
  return localPath;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: resolveDbPath(configService),
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
