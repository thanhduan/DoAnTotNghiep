import { IsNotEmpty, IsMongoId } from 'class-validator';

export class GoogleLoginDto {
  @IsNotEmpty()
  @IsMongoId()
  campusId: string;
}
