import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { Transfer, TransferSchema } from '@/database/schemas/transfer.schema';
import { Schedule, ScheduleSchema } from '@/database/schemas/schedule.schema';
import { Booking, BookingSchema } from '@/database/schemas/booking.schema';
import { User, UserSchema } from '@/database/schemas/user.schema';
import { GatewaysModule } from '../../common/gateways/gateways.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Transfer.name, schema: TransferSchema },
      { name: Schedule.name, schema: ScheduleSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    GatewaysModule,
    NotificationsModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
