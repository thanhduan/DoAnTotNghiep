import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
} from 'class-validator';
import { LockerStatus } from '@/common/enums';

export class CreateLockerDto {
  @IsNumber()
  lockerNumber: number;

  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsMongoId()
  campusId?: string | null;

  @IsOptional()
  @IsEnum(LockerStatus)
  status?: LockerStatus;

  @IsOptional()
  @IsNumber()
  batteryLevel?: number;

  @IsOptional()
  @IsDateString()
  lastConnection?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsMongoId()
  esp32Id?: string;

  @IsOptional()
  @IsArray()
  solenoids?: {
    id: string;
    connected: boolean;
  }[];
}
