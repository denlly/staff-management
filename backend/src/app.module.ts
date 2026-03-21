import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdirSync } from 'node:fs';
import { basename, dirname } from 'node:path';
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
    if (!configuredPath) {
      return '/tmp/staff_management.sqlite';
    }

    // Force any custom DB path into /tmp to avoid read-only filesystem failures.
    if (!configuredPath.startsWith('/tmp/')) {
      const fileName = basename(configuredPath) || 'staff_management.sqlite';
      return `/tmp/${fileName}`;
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
