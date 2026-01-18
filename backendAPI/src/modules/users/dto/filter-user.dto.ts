import { IsOptional, IsString, IsBoolean, IsMongoId } from 'class-validator';

export class FilterUserDto {
  @IsOptional()
  @IsMongoId()
  roleId?: string;

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
