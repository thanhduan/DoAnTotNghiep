import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { UserRole } from '@/common/enums';

export class FilterUserDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  campusId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}
