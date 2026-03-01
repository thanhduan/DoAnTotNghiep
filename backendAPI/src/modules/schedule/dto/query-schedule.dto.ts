import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';

export class QueryScheduleDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  lecturerId?: string;

  @IsOptional()
  @IsString()
  semester?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'ongoing', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsEnum(['OLDSLOT', 'NEWSLOT'])
  slotType?: string;

  @IsOptional()
  @IsString()
  classCode?: string;
}
