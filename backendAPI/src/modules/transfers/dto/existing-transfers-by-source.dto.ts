import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ExistingTransfersBySourceDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  sourceScheduleIds: string[];
}
