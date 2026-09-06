import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsString, Matches, ValidateIf } from 'class-validator';
import { Expose } from 'class-transformer';

export class UpdateTaskDto extends PartialType(
  OmitType(CreateTaskDto, ['projectId', 'createdById', 'backgroundColor']),
) {
  /**
   * 캘린더 색상
   */
  @Expose()
  @ValidateIf((_object, value) => value !== undefined)
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'backgroundColor는 #을 포함한 6자리 16진수여야 합니다.',
  })
  backgroundColor?: string;
}
