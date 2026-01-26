import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { GatewaysModule } from './common/gateways/gateways.module';
import { AuthModule } from './modules/auth/auth.module';
import { CampusModule } from './modules/campus/campus.module';
import { UsersModule } from './modules/users/users.module';
import { LockerModule } from './modules/locker/locker.module';
import { RoomModule } from './modules/room/room.module';
import { RolesModule } from './modules/roles/roles.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { TimeSlotsModule } from './modules/time-slots/time-slots.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    GatewaysModule,
    AuthModule,
    CampusModule,
    UsersModule,
    LockerModule,
    RoomModule,
    RolesModule,
    AuditLogsModule,
    ScheduleModule,
    TimeSlotsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
