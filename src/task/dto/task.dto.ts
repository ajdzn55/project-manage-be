import { Expose } from 'class-transformer';
import {
  TaskPriority,
  taskPriorityDesc,
  TaskStatus,
  taskStatusDesc,
} from '../../common/enums';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { getEnumDescriptionString } from '../../common/utils';

export class TaskDto {
  /**
   * 작업 ID
   */
  @Expose()
  @IsNotEmpty()
  @IsUUID()
  id: string;

  /**
   * 작업명
   */
  @Expose()
  @IsString()
  name: string;

  /**
   * 작업 설명
   */
  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  /**
   * 작업 상태
   */
  @Expose()
  @IsOptional()
  @IsEnum(TaskStatus)
  @ApiPropertyOptional({
    enum: TaskStatus,
    description: `상태 [${getEnumDescriptionString(taskStatusDesc)}]`,
  })
  status?: TaskStatus | null;

  /**
   * 우선순위
   */
  @Expose()
  @IsOptional()
  @IsEnum(TaskPriority)
  @ApiPropertyOptional({
    enum: TaskPriority,
    description: `우선순위 [${getEnumDescriptionString(taskPriorityDesc)}]`,
  })
  priority?: TaskPriority | null;

  /**
   * 담당자 아이디
   */
  @Expose()
  @IsOptional()
  @IsString()
  assigneeId?: string | null;

  /**
   * 마감일자
   * @example 2026-08-31
   */
  @Expose()
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  /**
   * 생성자 아이디
   */
  @Expose()
  @IsNotEmpty()
  @IsString()
  createdById: string;

  /**
   * 캘린더 색상
   */
  @Expose()
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'backgroundColor는 #을 포함한 6자리 16진수여야 합니다.',
  })
  backgroundColor?: string;
}
