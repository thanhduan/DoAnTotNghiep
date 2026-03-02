import { IsString, IsOptional } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  roomId: string;
  @IsString()
  lockerId: string;
  @IsString()
  fromUserId: string;
  @IsString()
  toUserId: string;
  @IsString()
  campusId: string;
  @IsString()
  fromScheduleId: string;
  @IsString()
  toScheduleId: string;
  @IsOptional()
  @IsString()
  transferDate?: string;
  @IsOptional()
  @IsString()
  reason?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsString()
  approvedAt?: string;
  @IsOptional()
  @IsString()
  completedAt?: string;
  @IsOptional()
  @IsString()
  notes?: string;
  @IsOptional()
  @IsString()
  createdAt?: string;
  @IsOptional()
  @IsString()
  updatedAt?: string;
}
