import { IsString, IsNotEmpty, IsArray, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[]; // Array of permission ObjectIds

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
