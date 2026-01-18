import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, IsMongoId } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Họ tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsMongoId({ message: 'RoleId không hợp lệ' })
  @IsNotEmpty({ message: 'RoleId không được để trống' })
  roleId: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Số điện thoại phải có 10 chữ số' })
  phone?: string;

  @IsOptional()
  @IsString()
  campusId?: string;
}
