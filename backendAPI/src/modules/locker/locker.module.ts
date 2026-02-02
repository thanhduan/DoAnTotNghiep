import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LockerController } from './locker.controller';
import { LockerService } from './locker.service';

import { Locker, LockerSchema } from '@/database/schemas/locker.schema';
import { Campus, CampusSchema } from '@/database/schemas/campus.schema';
import { ESP32, ESP32Schema } from '@/database/schemas/esp32.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Locker.name, schema: LockerSchema },
      { name: Campus.name, schema: CampusSchema },
      { name: ESP32.name, schema: ESP32Schema },
    ]),
  ],
  controllers: [LockerController],
  providers: [LockerService],
})
export class LockerModule {}
