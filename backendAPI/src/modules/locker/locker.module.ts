import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LockerController } from './locker.controller';
import { Esp32Controller } from './locker.controller';
import { LockerService } from './locker.service';
import { Locker, LockerSchema } from '@/database/schemas/locker.schema';
import { CampusSchema } from '@/database/schemas/campus.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Locker.name, schema: LockerSchema },
      { name: 'Campus', schema: CampusSchema },
    ]),
  ],
  controllers: [LockerController, Esp32Controller],
  providers: [LockerService],
})
export class LockerModule {}
