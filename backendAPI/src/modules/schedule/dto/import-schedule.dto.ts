import { IsEnum, IsOptional } from 'class-validator';

export class ImportScheduleDto {
  /**
   * Import mode:
   * - dryRun: Only validate and return preview, no insertion
   * - strict: Fail entire import if any error found
   * - lenient: Skip error rows, insert valid ones only
   */
  @IsEnum(['dryRun', 'strict', 'lenient'])
  @IsOptional()
  mode?: 'dryRun' | 'strict' | 'lenient' = 'strict';
}
