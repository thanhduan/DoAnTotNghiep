import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { Transfer, TransferSchema } from '@/database/schemas/transfer.schema';
import { GatewaysModule } from '../../common/gateways/gateways.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transfer.name, schema: TransferSchema }]),
    GatewaysModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
