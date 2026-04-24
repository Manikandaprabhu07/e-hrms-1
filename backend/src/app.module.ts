import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmployeesModule } from './employees/employees.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { LeaveModule } from './leave/leave.module';
import { TrainingModule } from './training/training.module';
import { PerformanceModule } from './performance/performance.module';
import { AccessModule } from './access/access.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { ChatbarModule } from './chatbar/chatbar.module';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { SeedService } from './seed/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const parseBool = (value: unknown): boolean | undefined => {
          if (value === undefined || value === null) return undefined;
          if (typeof value === 'boolean') return value;
          if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
            if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
          }
          return undefined;
        };

        const sslEnabled =
          parseBool(configService.get('DB_SSL')) ??
          (databaseUrl ? true : false);

        const sslConfig = sslEnabled
          ? {
              rejectUnauthorized:
                parseBool(configService.get('DB_SSL_REJECT_UNAUTHORIZED')) ?? false,
            }
          : undefined;

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            autoLoadEntities: true,
            synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
            ssl: sslConfig,
          };
        }

        // Fallback to individual env vars if DATABASE_URL is not provided
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
          ssl: sslConfig,
        };
      },
      inject: [ConfigService],
    }),
    EmployeesModule,
    UsersModule,
    AuthModule,
    AttendanceModule,
    PayrollModule,
    LeaveModule,
    TrainingModule,
    PerformanceModule,
    AccessModule,
    FeedbackModule,
    DashboardModule,
    EventsModule,
    NotificationsModule,
    MessagesModule,
    ChatbarModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    SeedService,
  ],
})
export class AppModule { }
