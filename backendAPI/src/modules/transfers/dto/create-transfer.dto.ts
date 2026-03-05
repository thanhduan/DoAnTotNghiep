import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  lockerId: string;

  @IsString()
  @IsNotEmpty()
  toUserId: string;

  @IsString()
  @IsNotEmpty()
  fromScheduleId: string;

  @IsString()
  @IsNotEmpty()
  toScheduleId: string;

  @IsOptional()
  @IsString()
  transferDate?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
