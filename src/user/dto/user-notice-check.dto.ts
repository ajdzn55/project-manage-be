import { Expose } from 'class-transformer';
import { IsDateString, IsOptional } from 'class-validator';

export class UserNoticeCheckDto {
  /**
   * 마지막 확인일자
   * @example 2026-09-15
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  lastCheckedDate: string | null;
}
