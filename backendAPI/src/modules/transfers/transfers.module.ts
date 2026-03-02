import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { Transfer, TransferSchema } from './transfers.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Transfer.name, schema: TransferSchema }])],
  controllers: [TransfersController],
  providers: [TransfersService],
})
export class TransfersModule {}
