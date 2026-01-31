import { IsString, IsEnum, IsMongoId, IsNumber, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  deviceCode: string;

  @IsString()
  deviceName: string;

  @IsEnum(['ok', 'broken'])
  @IsOptional()
  deviceStatus?: 'ok' | 'broken';

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsMongoId()
  roomId: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
