import { Module } from '@nestjs/common';
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

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
